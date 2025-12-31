'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  SkillTemplate,
  SkillTemplateQuestion,
  SkillTemplateWithQuestions,
  SkillTemplateQuestionWithOptions,
  SkillTemplateWithQuestionsAndOptions,
  QuestionOption,
} from '@/types/database'
import { SKILL_RATING_OPTIONS } from '@/types/database'

/**
 * Get the default template (marked with is_default)
 */
export async function getDefaultTemplate(): Promise<SkillTemplateWithQuestionsAndOptions | null> {
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from('skill_templates')
    .select('*')
    .eq('is_default', true)
    .eq('is_active', true)
    .single()

  if (error || !template) {
    // Fallback to PM template if no default set
    const { data: pmTemplate } = await supabase
      .from('skill_templates')
      .select('*')
      .eq('slug', 'product-manager')
      .eq('is_active', true)
      .single()

    if (pmTemplate) {
      return getTemplateWithOptionsById(pmTemplate.id)
    }
    return null
  }

  return getTemplateWithOptionsById(template.id)
}

/**
 * Get a template by ID with its questions (without options)
 */
export async function getTemplateById(templateId: string): Promise<SkillTemplateWithQuestions | null> {
  const supabase = await createClient()

  const { data: template, error: templateError } = await supabase
    .from('skill_templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_active', true)
    .single()

  if (templateError || !template) {
    console.error('Get template error:', templateError)
    return null
  }

  const { data: questions, error: questionsError } = await supabase
    .from('skill_template_questions')
    .select('*')
    .eq('template_id', templateId)
    .order('question_order')

  if (questionsError) {
    console.error('Get template questions error:', questionsError)
    return null
  }

  return {
    ...(template as SkillTemplate),
    questions: (questions || []) as SkillTemplateQuestion[],
  }
}

/**
 * Get a template by ID with questions AND their answer options
 */
export async function getTemplateWithOptionsById(
  templateId: string
): Promise<SkillTemplateWithQuestionsAndOptions | null> {
  const supabase = await createClient()

  const { data: template, error: templateError } = await supabase
    .from('skill_templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_active', true)
    .single()

  if (templateError || !template) {
    console.error('Get template error:', templateError)
    return null
  }

  const { data: questions, error: questionsError } = await supabase
    .from('skill_template_questions')
    .select('*')
    .eq('template_id', templateId)
    .order('question_order')

  if (questionsError) {
    console.error('Get template questions error:', questionsError)
    return null
  }

  // Get options for all questions
  const questionIds = (questions || []).map((q) => q.id)
  const { data: options, error: optionsError } = await supabase
    .from('question_options')
    .select('*')
    .in('question_id', questionIds)
    .order('option_order')

  if (optionsError) {
    console.error('Get question options error:', optionsError)
    // Continue without options - will use default
  }

  // Map options to questions, with fallback to default rating options
  const optionsByQuestion = (options || []).reduce(
    (acc, opt) => {
      if (!acc[opt.question_id]) acc[opt.question_id] = []
      acc[opt.question_id].push(opt)
      return acc
    },
    {} as Record<string, QuestionOption[]>
  )

  const defaultOptions: QuestionOption[] = SKILL_RATING_OPTIONS.map((opt, idx) => ({
    id: `default-${idx}`,
    question_id: '',
    value: opt.value,
    label: opt.label,
    description: opt.description,
    option_order: idx + 1,
    is_separator: 'separatorBefore' in opt ? opt.separatorBefore : false,
    created_at: new Date().toISOString(),
  }))

  const questionsWithOptions = (questions || []).map((q) => ({
    ...q,
    options: optionsByQuestion[q.id]?.length > 0 ? optionsByQuestion[q.id] : defaultOptions,
  }))

  return {
    ...(template as SkillTemplate),
    questions: questionsWithOptions as SkillTemplateQuestionWithOptions[],
  }
}

/**
 * Get a template by slug with its questions
 */
export async function getTemplateBySlug(slug: string): Promise<SkillTemplateWithQuestions | null> {
  const supabase = await createClient()

  const { data: template, error: templateError } = await supabase
    .from('skill_templates')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (templateError || !template) {
    console.error('Get template by slug error:', templateError)
    return null
  }

  return getTemplateById(template.id)
}

/**
 * Get all active templates
 */
export async function getAllTemplates(): Promise<SkillTemplate[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('skill_templates')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Get all templates error:', error)
    return []
  }

  return (data || []) as SkillTemplate[]
}

/**
 * Get questions for self-assessment from a template
 */
export async function getSelfAssessmentQuestions(templateId: string): Promise<SkillTemplateQuestion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('skill_template_questions')
    .select('*')
    .eq('template_id', templateId)
    .eq('use_for_self_assessment', true)
    .order('question_order')

  if (error) {
    console.error('Get self-assessment questions error:', error)
    return []
  }

  return (data || []) as SkillTemplateQuestion[]
}
