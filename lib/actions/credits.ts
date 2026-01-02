'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import { createClient } from '@/lib/supabase/server'
import { CYCLE_COST, CREDIT_PACKAGE_AMOUNT } from '@/lib/credits-constants'

// Re-export for convenience (not needed since constants file is used directly)
// Consumers should import from '@/lib/credits-constants' for constants

/**
 * Get current user's credit balance
 */
export async function getUserCredits(): Promise<number> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    console.error('Get credits error:', error)
    return 0
  }

  return data.credits
}

/**
 * Check if user has enough credits to run a cycle
 */
export async function hasEnoughCredits(): Promise<boolean> {
  const credits = await getUserCredits()
  return credits >= CYCLE_COST
}

/**
 * Deduct credits for running a cycle
 * Returns true if successful, false if not enough credits
 */
export async function deductCycleCredits(): Promise<{ success: boolean; credits?: number; error?: string }> {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get current credits
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (fetchError || !userData) {
    return { success: false, error: 'Failed to fetch credits' }
  }

  if (userData.credits < CYCLE_COST) {
    return { success: false, error: 'Not enough credits', credits: userData.credits }
  }

  // Deduct credits
  const newCredits = userData.credits - CYCLE_COST
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits: newCredits })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: 'Failed to deduct credits' }
  }

  revalidatePath('/dashboard')
  return { success: true, credits: newCredits }
}

/**
 * Add credits to user account (temporary free credits flow)
 * Only adds if user has less than 10 credits
 */
export async function addFreeCredits(): Promise<{ success: boolean; credits?: number; message?: string }> {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get current credits
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (fetchError || !userData) {
    return { success: false, message: 'Failed to fetch credits' }
  }

  // Only add if less than 10
  if (userData.credits >= CREDIT_PACKAGE_AMOUNT) {
    return {
      success: false,
      credits: userData.credits,
      message: 'You already have enough credits'
    }
  }

  // Add credits
  const newCredits = userData.credits + CREDIT_PACKAGE_AMOUNT
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits: newCredits })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, message: 'Failed to add credits' }
  }

  revalidatePath('/dashboard')
  return {
    success: true,
    credits: newCredits,
    message: "We're still working on the payment system and aren't accepting payments yet. We've added 10 free credits to your account!"
  }
}

/**
 * Check if user has created any cycles (for showing credits UI)
 */
export async function hasCreatedAnyCycles(): Promise<boolean> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('feedback_cycles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('Check cycles error:', error)
    return false
  }

  return (count || 0) > 0
}
