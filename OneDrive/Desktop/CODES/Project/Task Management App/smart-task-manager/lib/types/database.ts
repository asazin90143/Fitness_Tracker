export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type EisenhowerCategory = 'do_first' | 'schedule' | 'delegate' | 'delete'
export type ManualPriority = 'low' | 'medium' | 'high' | 'critical'
export type TeamRole = 'owner' | 'admin' | 'member'

export interface User {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export interface Team {
    id: string
    name: string
    description: string | null
    owner_id: string
    created_at: string
    updated_at: string
}

export interface Project {
    id: string
    name: string
    description: string | null
    team_id: string | null
    owner_id: string
    color: string
    created_at: string
    updated_at: string
}

export interface Task {
    id: string
    title: string
    description: string | null
    project_id: string
    assigned_to: string | null
    created_by: string
    status: TaskStatus
    priority_score: number
    eisenhower_category: EisenhowerCategory | null
    manual_priority: ManualPriority | null
    due_date: string | null
    completed_at: string | null
    position: number
    created_at: string
    updated_at: string
}