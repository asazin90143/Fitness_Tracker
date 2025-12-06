'use server'

import { createClient } from '@/lib/supabase/server'
import { calculatePriority } from '@/lib/utils/calculate-priority'
import { createTaskSchema } from '@/lib/validations/task'

export async function createTask(input: unknown) {
    const supabase = createClient()

    // Validate input
    const validated = createTaskSchema.parse(input)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Calculate initial priority
    const priority = calculatePriority({
        title: validated.title,
        description: validated.description,
        dueDate: validated.due_date,
        manualPriority: validated.manual_priority,
        createdAt: new Date().toISOString(),
    })

    // Create task with calculated priority
    const { data, error } = await supabase
        .from('tasks')
        .insert({
            ...validated,
            created_by: user.id,
            priority_score: priority.score,
            eisenhower_category: priority.eisenhower_category,
        })
        .select()
        .single()

    if (error) throw error

    return { success: true, task: data }
}