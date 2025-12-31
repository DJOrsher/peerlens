'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import type {
  SkillTemplate,
  SkillTemplateQuestion,
  SkillTemplateWithQuestionsAndOptions,
  QuestionOption,
  QuestionType,
} from '@/types/database'

// ============================================
// TEMPLATES
// ============================================

export async function getTemplates(): Promise<SkillTemplate[]> {
  await requireAdmin()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('skill_templates')
    .select('*')
    .order('is_default', { ascending: false })
    .order('name')

  if (error) throw error
  return data || []
}

export async function getTemplateForAdmin(
  id: string
): Promise<SkillTemplateWithQuestionsAndOptions | null> {
  await requireAdmin()
  const supabase = createServiceClient()

  // Get template
  const { data: template, error: templateError } = await supabase
    .from('skill_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (templateError) {
    if (templateError.code === 'PGRST116') return null
    throw templateError
  }

  // Get questions with options
  const { data: questions, error: questionsError } = await supabase
    .from('skill_template_questions')
    .select('*')
    .eq('template_id', id)
    .order('question_order')

  if (questionsError) throw questionsError

  // Get options for all questions
  const questionIds = (questions || []).map((q) => q.id)
  const { data: options, error: optionsError } = await supabase
    .from('question_options')
    .select('*')
    .in('question_id', questionIds)
    .order('option_order')

  if (optionsError) throw optionsError

  // Map options to questions
  const optionsByQuestion = (options || []).reduce(
    (acc, opt) => {
      if (!acc[opt.question_id]) acc[opt.question_id] = []
      acc[opt.question_id].push(opt)
      return acc
    },
    {} as Record<string, QuestionOption[]>
  )

  const questionsWithOptions = (questions || []).map((q) => ({
    ...q,
    options: optionsByQuestion[q.id] || [],
  }))

  return {
    ...template,
    questions: questionsWithOptions,
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createTemplate(data: {
  name: string
  description?: string
}): Promise<{ id: string } | { error: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  const slug = generateSlug(data.name)

  const { data: template, error } = await supabase
    .from('skill_templates')
    .insert({
      name: data.name,
      slug,
      description: data.description || null,
      is_active: true,
      is_default: false,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'A template with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { id: template.id }
}

export async function updateTemplate(
  id: string,
  data: {
    name?: string
    description?: string
    is_active?: boolean
  }
): Promise<{ success: boolean } | { error: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) {
    updateData.name = data.name
    updateData.slug = generateSlug(data.name)
  }
  if (data.description !== undefined) updateData.description = data.description
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  const { error } = await supabase
    .from('skill_templates')
    .update(updateData)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A template with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/templates/${id}`)
  return { success: true }
}

export async function deleteTemplate(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  // Check if this is the default template
  const { data: template } = await supabase
    .from('skill_templates')
    .select('is_default')
    .eq('id', id)
    .single()

  if (template?.is_default) {
    return { error: 'Cannot delete the default template' }
  }

  const { error } = await supabase.from('skill_templates').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function setDefaultTemplate(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  // Remove default from all templates
  await supabase.from('skill_templates').update({ is_default: false }).neq('id', '')

  // Set this one as default
  const { error } = await supabase
    .from('skill_templates')
    .update({ is_default: true })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

// ============================================
// QUESTIONS
// ============================================

export async function createQuestion(
  templateId: string,
  data: {
    skill_key: string
    skill_name: string
    skill_description: string
    question_type: QuestionType
    use_for_self_assessment?: boolean
    use_for_peer_feedback?: boolean
  }
): Promise<{ id: string } | { error: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  // Get next order
  const { data: existing } = await supabase
    .from('skill_template_questions')
    .select('question_order')
    .eq('template_id', templateId)
    .order('question_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.question_order ?? 0) + 1

  const { data: question, error } = await supabase
    .from('skill_template_questions')
    .insert({
      template_id: templateId,
      skill_key: data.skill_key,
      skill_name: data.skill_name,
      skill_description: data.skill_description,
      question_type: data.question_type,
      question_order: nextOrder,
      use_for_self_assessment: data.use_for_self_assessment ?? true,
      use_for_peer_feedback: data.use_for_peer_feedback ?? true,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'A question with this key already exists' }
    }
    return { error: error.message }
  }

  revalidatePath(`/admin/templates/${templateId}`)
  return { id: question.id }
}

export async function updateQuestion(
  id: string,
  data: {
    skill_key?: string
    skill_name?: string
    skill_description?: string
    question_type?: QuestionType
    use_for_self_assessment?: boolean
    use_for_peer_feedback?: boolean
  }
): Promise<{ success: boolean } | { error: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  // Get template_id for revalidation
  const { data: question } = await supabase
    .from('skill_template_questions')
    .select('template_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('skill_template_questions')
    .update(data)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A question with this key already exists' }
    }
    return { error: error.message }
  }

  if (question) {
    revalidatePath(`/admin/templates/${question.template_id}`)
  }
  return { success: true }
}

export async function deleteQuestion(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  // Get template_id for revalidation
  const { data: question } = await supabase
    .from('skill_template_questions')
    .select('template_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('skill_template_questions')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  if (question) {
    revalidatePath(`/admin/templates/${question.template_id}`)
  }
  return { success: true }
}

export async function reorderQuestions(
  templateId: string,
  questionIds: string[]
): Promise<{ success: boolean } | { error: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  // Update each question with new order
  for (let i = 0; i < questionIds.length; i++) {
    const { error } = await supabase
      .from('skill_template_questions')
      .update({ question_order: i + 1 })
      .eq('id', questionIds[i])

    if (error) return { error: error.message }
  }

  revalidatePath(`/admin/templates/${templateId}`)
  return { success: true }
}

// ============================================
// QUESTION OPTIONS
// ============================================

export async function getQuestionOptions(
  questionId: string
): Promise<QuestionOption[]> {
  await requireAdmin()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('question_options')
    .select('*')
    .eq('question_id', questionId)
    .order('option_order')

  if (error) throw error
  return data || []
}

export async function saveQuestionOptions(
  questionId: string,
  options: Array<{
    value: string
    label: string
    description?: string
    is_separator?: boolean
  }>
): Promise<{ success: boolean } | { error: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  // Delete existing options
  await supabase.from('question_options').delete().eq('question_id', questionId)

  // Insert new options
  if (options.length > 0) {
    const { error } = await supabase.from('question_options').insert(
      options.map((opt, index) => ({
        question_id: questionId,
        value: opt.value,
        label: opt.label,
        description: opt.description || null,
        option_order: index + 1,
        is_separator: opt.is_separator || false,
      }))
    )

    if (error) return { error: error.message }
  }

  // Get template_id for revalidation
  const { data: question } = await supabase
    .from('skill_template_questions')
    .select('template_id')
    .eq('id', questionId)
    .single()

  if (question) {
    revalidatePath(`/admin/templates/${question.template_id}`)
  }
  return { success: true }
}

export async function copyPresetToQuestion(
  questionId: string,
  presetId: string
): Promise<{ success: boolean } | { error: string }> {
  // Import here to avoid circular dependency
  const { getPresetById } = await import('@/lib/preset-scales')

  const preset = getPresetById(presetId)
  if (!preset) {
    return { error: 'Preset not found' }
  }

  return saveQuestionOptions(
    questionId,
    preset.options.map((opt) => ({
      value: opt.value,
      label: opt.label,
      description: opt.description,
      is_separator: opt.is_separator,
    }))
  )
}
