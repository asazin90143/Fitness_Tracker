import { z } from 'zod'

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    project_id: z.string().uuid(),
    assigned_to: z.string().uuid().optional(),
    due_date: z.string().datetime().optional(),
    manual_priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
})

export const updateTaskSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
    assigned_to: z.string().uuid().nullable().optional(),
    due_date: z.string().datetime().nullable().optional(),
    manual_priority: z.enum(['low', 'medium', 'high', 'critical']).nullable().optional(),
    position: z.number().int().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>