'use server'

import { createClient } from '@/lib/supabase/server'
import { calculatePriority } from '@/lib/utils/calculate-priority'

export interface ClassifyTaskInput {
    taskId: string
    title: string
    description?: string | null
    dueDate?: string | null
    manualPriority?: string | null
}

export interface ClassifyTaskResult {
    success: boolean
    eisenhower_category?: 'do_first' | 'schedule' | 'delegate' | 'delete'
    priority_score?: number
    reasoning?: string
    error?: string
}

/**
 * Classifies a task using rule-based priority calculation.
 * No external API required - instant results.
 */
export async function classifyTask(
    input: ClassifyTaskInput
): Promise<ClassifyTaskResult> {
    try {
        const supabase = createClient()

        // Fetch task to get created_at timestamp
        const { data: task, error: fetchError } = await supabase
            .from('tasks')
            .select('id, created_at')
            .eq('id', input.taskId)
            .single()

        if (fetchError || !task) {
            return {
                success: false,
                error: 'Task not found or access denied',
            }
        }

        // Calculate priority using rule-based algorithm
        const classification = calculatePriority({
            title: input.title,
            description: input.description,
            dueDate: input.dueDate,
            manualPriority: input.manualPriority as any,
            createdAt: task.created_at,
        })

        // Update task in database
        const { error: updateError } = await supabase
            .from('tasks')
            .update({
                eisenhower_category: classification.eisenhower_category,
                priority_score: classification.score,
                updated_at: new Date().toISOString(),
            })
            .eq('id', input.taskId)

        if (updateError) {
            return {
                success: false,
                error: 'Failed to update task',
            }
        }

        return {
            success: true,
            eisenhower_category: classification.eisenhower_category,
            priority_score: classification.score,
            reasoning: classification.reasoning,
        }
    } catch (error) {
        console.error('Error classifying task:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}