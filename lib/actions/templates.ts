'use server'

import { createClient } from '@/lib/supabase/server'
import type { SkillTemplate, SkillTemplateQuestion, SkillTemplateWithQuestions } from '@/types/database'

const PM_TEMPLATE_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Get the default PM template
 */
export async function getDefaultTemplate(): Promise<SkillTemplateWithQuestions | null> {
  return getTemplateById(PM_TEMPLATE_ID)
}

/**
 * Get a template by ID with its questions
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
