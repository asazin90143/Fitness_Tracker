'use client'

import { Task } from '@/lib/types/database'
import { getTaskUrgencyStyles } from '@/lib/utils/task-urgency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Calendar, User } from 'lucide-react'

interface TaskCardProps {
    task: Task
    isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
    const urgencyStyles = getTaskUrgencyStyles(task.due_date)

    return (
        <Card
            className={`
        ${urgencyStyles.containerClass}
        ${urgencyStyles.borderClass}
        ${isDragging ? 'opacity-50 rotate-2' : 'hover:shadow-md'}
        transition-all duration-200 cursor-grab active:cursor-grabbing
      `}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className={`text-sm ${urgencyStyles.textClass}`}>
                        {task.title}
                    </CardTitle>
                    {task.due_date && (
                        <Badge variant={urgencyStyles.badgeVariant} className="shrink-0">
                            {urgencyStyles.badgeText}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {task.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {task.due_date && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.due_date), 'MMM d')}
                        </div>
                    )}

                    {task.assigned_to && (
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Assigned
                        </div>
                    )}
                </div>

                {task.eisenhower_category && (
                    <Badge variant="outline" className="text-xs">
                        {formatEisenhowerCategory(task.eisenhower_category)}
                    </Badge>
                )}

                {task.priority_score !== null && (
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${getPriorityColor(
                                    task.priority_score
                                )}`}
                                style={{ width: `${task.priority_score}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium">{task.priority_score}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function formatEisenhowerCategory(category: string): string {
    const map: Record<string, string> = {
        do_first: '🔥 Do First',
        schedule: '📅 Schedule',
        delegate: '👥 Delegate',
        delete: '🗑️ Consider Deleting',
    }
    return map[category] || category
}

function getPriorityColor(score: number): string {
    if (score >= 80) return 'bg-red-500'
    if (score >= 60) return 'bg-orange-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-green-500'
}