import { differenceInHours } from 'date-fns'

export interface TaskPriorityInput {
    title: string
    description?: string | null
    dueDate?: string | null
    manualPriority?: 'low' | 'medium' | 'high' | 'critical' | null
    createdAt: string
}

export interface PriorityResult {
    score: number // 0-100
    eisenhower_category: 'do_first' | 'schedule' | 'delegate' | 'delete'
    reasoning: string
}

/**
 * Calculates task priority using a weighted scoring system.
 * Designed for freelance web developers where client work > internal work.
 * 
 * Scoring factors:
 * - Deadline urgency (40% weight)
 * - Manual priority (30% weight)
 * - Business context keywords (20% weight)
 * - Task age (10% weight)
 */
export function calculatePriority(input: TaskPriorityInput): PriorityResult {
    let score = 0
    let urgencyPoints = 0
    let manualPoints = 0
    let contextPoints = 0
    let agePoints = 0

    // 1. DEADLINE URGENCY (0-40 points)
    if (input.dueDate) {
        const hoursUntilDue = differenceInHours(new Date(input.dueDate), new Date())

        if (hoursUntilDue < 0) {
            urgencyPoints = 40 // Overdue = maximum urgency
        } else if (hoursUntilDue < 24) {
            urgencyPoints = 35 // < 1 day = critical
        } else if (hoursUntilDue < 72) {
            urgencyPoints = 25 // < 3 days = high urgency
        } else if (hoursUntilDue < 168) {
            urgencyPoints = 15 // < 1 week = medium urgency
        } else {
            urgencyPoints = 5 // > 1 week = low urgency
        }
    } else {
        urgencyPoints = 10 // No deadline = default medium-low
    }

    // 2. MANUAL PRIORITY OVERRIDE (0-30 points)
    const manualPriorityMap = {
        critical: 30,
        high: 22,
        medium: 15,
        low: 5,
    }
    manualPoints = input.manualPriority ? manualPriorityMap[input.manualPriority] : 15

    // 3. BUSINESS CONTEXT KEYWORDS (0-20 points)
    const fullText = `${input.title} ${input.description || ''}`.toLowerCase()

    // High importance keywords for freelancers
    const highValueKeywords = [
        'client', 'payment', 'invoice', 'bug', 'production', 'deploy',
        'urgent', 'asap', 'deadline', 'meeting', 'demo', 'presentation',
        'critical', 'error', 'down', 'broken', 'emergency'
    ]

    // Medium importance
    const mediumValueKeywords = [
        'feature', 'implement', 'build', 'develop', 'design', 'review',
        'milestone', 'deliverable', 'requirement'
    ]

    // Low importance (nice-to-haves)
    const lowValueKeywords = [
        'refactor', 'optimize', 'cleanup', 'documentation', 'learn',
        'research', 'explore', 'consider', 'maybe', 'eventually'
    ]

    const highMatches = highValueKeywords.filter(kw => fullText.includes(kw)).length
    const mediumMatches = mediumValueKeywords.filter(kw => fullText.includes(kw)).length
    const lowMatches = lowValueKeywords.filter(kw => fullText.includes(kw)).length

    if (highMatches > 0) {
        contextPoints = Math.min(20, highMatches * 7) // Each high keyword = 7 points
    } else if (mediumMatches > 0) {
        contextPoints = Math.min(15, mediumMatches * 5)
    } else if (lowMatches > 0) {
        contextPoints = Math.max(3, 10 - lowMatches * 2) // Low keywords decrease score
    } else {
        contextPoints = 10 // Default
    }

    // 4. TASK AGE (0-10 points)
    // Older tasks get slight priority boost to prevent indefinite postponement
    const hoursOld = differenceInHours(new Date(), new Date(input.createdAt))
    const daysOld = hoursOld / 24

    if (daysOld > 30) {
        agePoints = 10
    } else if (daysOld > 14) {
        agePoints = 7
    } else if (daysOld > 7) {
        agePoints = 5
    } else {
        agePoints = 2
    }

    // CALCULATE FINAL SCORE
    score = urgencyPoints + manualPoints + contextPoints + agePoints
    score = Math.min(100, Math.max(0, score)) // Clamp to 0-100

    // DETERMINE EISENHOWER CATEGORY
    const isUrgent = urgencyPoints >= 20
    const isImportant = contextPoints >= 12 || manualPoints >= 20

    let category: PriorityResult['eisenhower_category']
    if (isUrgent && isImportant) {
        category = 'do_first'
    } else if (!isUrgent && isImportant) {
        category = 'schedule'
    } else if (isUrgent && !isImportant) {
        category = 'delegate'
    } else {
        category = 'delete'
    }

    // GENERATE REASONING
    const reasoning = generateReasoning({
        score,
        urgencyPoints,
        manualPoints,
        contextPoints,
        agePoints,
        category,
        dueDate: input.dueDate,
    })

    return { score, eisenhower_category: category, reasoning }
}

function generateReasoning(data: {
    score: number
    urgencyPoints: number
    manualPoints: number
    contextPoints: number
    agePoints: number
    category: PriorityResult['eisenhower_category']
    dueDate?: string | null
}): string {
    const parts: string[] = []

    if (data.urgencyPoints >= 35) {
        parts.push('Extremely urgent deadline')
    } else if (data.urgencyPoints >= 25) {
        parts.push('Approaching deadline')
    } else if (data.urgencyPoints >= 15) {
        parts.push('Moderate deadline pressure')
    }

    if (data.manualPoints >= 25) {
        parts.push('manually marked as critical')
    } else if (data.manualPoints >= 20) {
        parts.push('manually marked as high priority')
    }

    if (data.contextPoints >= 15) {
        parts.push('contains high-value business keywords')
    } else if (data.contextPoints <= 5) {
        parts.push('appears to be low-priority maintenance work')
    }

    if (data.agePoints >= 7) {
        parts.push('has been pending for a while')
    }

    const categoryExplanationMap: Record<PriorityResult['eisenhower_category'], string> = {
        do_first: 'Do this immediately - urgent and important',
        schedule: 'Schedule focused time - important but not urgent',
        delegate: 'Consider delegating - urgent but less important',
        delete: 'Reconsider if this is necessary - neither urgent nor important',
    }

    const categoryExplanation = categoryExplanationMap[data.category]

    const reasoning = parts.length > 0
        ? `${parts.join(', ')}. ${categoryExplanation}.`
        : categoryExplanation

    return reasoning
}