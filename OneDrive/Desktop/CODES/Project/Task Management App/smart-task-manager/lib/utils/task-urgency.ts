import { differenceInHours, differenceInDays, isPast } from 'date-fns'

export type UrgencyLevel = 'critical' | 'urgent' | 'warning' | 'safe' | 'overdue' | 'none'

export interface TaskUrgencyStyles {
    level: UrgencyLevel
    containerClass: string
    borderClass: string
    textClass: string
    badgeVariant: 'destructive' | 'default' | 'secondary' | 'outline'
    badgeText: string
}

/**
 * Calculates visual urgency styling based on task deadline.
 * 
 * Logic breakdown for freelance web dev context:
 * - Overdue: Past due date (client deliverable missed)
 * - Critical: < 24 hours (drop everything, ship it)
 * - Urgent: < 3 days (prioritize, minimize distractions)
 * - Warning: < 7 days (schedule focused work blocks)
 * - Safe: > 7 days (normal workflow)
 * 
 * @param dueDate - ISO string of task due date
 * @returns Styling configuration object
 */
export function getTaskUrgencyStyles(dueDate: string | null): TaskUrgencyStyles {
    if (!dueDate) {
        return {
            level: 'none',
            containerClass: 'bg-white',
            borderClass: 'border-gray-200',
            textClass: 'text-gray-900',
            badgeVariant: 'secondary',
            badgeText: 'No deadline',
        }
    }

    const now = new Date()
    const deadline = new Date(dueDate)

    // Check if overdue
    if (isPast(deadline) && !isSameDay(now, deadline)) {
        return {
            level: 'overdue',
            containerClass: 'bg-red-50 border-2',
            borderClass: 'border-red-600',
            textClass: 'text-red-900 font-semibold',
            badgeVariant: 'destructive',
            badgeText: '⚠️ Overdue',
        }
    }

    const hoursRemaining = differenceInHours(deadline, now)
    const daysRemaining = differenceInDays(deadline, now)

    // Critical: Less than 24 hours
    if (hoursRemaining < 24) {
        return {
            level: 'critical',
            containerClass: 'bg-red-100 border-2',
            borderClass: 'border-red-500',
            textClass: 'text-red-900 font-bold',
            badgeVariant: 'destructive',
            badgeText: `🔥 ${hoursRemaining}h left`,
        }
    }

    // Urgent: Less than 3 days
    if (daysRemaining < 3) {
        return {
            level: 'urgent',
            containerClass: 'bg-orange-50',
            borderClass: 'border-orange-500 border-2',
            textClass: 'text-orange-900 font-semibold',
            badgeVariant: 'default',
            badgeText: `⏰ ${daysRemaining}d left`,
        }
    }

    // Warning: Less than 7 days
    if (daysRemaining < 7) {
        return {
            level: 'warning',
            containerClass: 'bg-yellow-50',
            borderClass: 'border-yellow-400',
            textClass: 'text-yellow-900',
            badgeVariant: 'outline',
            badgeText: `📅 ${daysRemaining}d left`,
        }
    }

    // Safe: More than 7 days
    return {
        level: 'safe',
        containerClass: 'bg-white',
        borderClass: 'border-green-500',
        textClass: 'text-gray-900',
        badgeVariant: 'secondary',
        badgeText: `✓ ${daysRemaining}d left`,
    }
}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}