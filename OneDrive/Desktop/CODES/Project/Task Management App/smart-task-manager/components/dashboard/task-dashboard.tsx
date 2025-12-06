import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, LayoutDashboard, List, Plus, Sparkles } from 'lucide-react';

// Mock task data for demonstration
interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    due_date: string | null;
    priority_score: number;
    eisenhower_category: string | null;
    position: number;
}

const MOCK_TASKS: Task[] = [
    {
        id: '1',
        title: 'Fix critical payment bug',
        description: 'Client reported checkout failures',
        status: 'todo',
        due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        priority_score: 95,
        eisenhower_category: 'do_first',
        position: 0,
    },
    {
        id: '2',
        title: 'Deploy staging environment',
        description: 'Set up staging server for client preview',
        status: 'in_progress',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority_score: 75,
        eisenhower_category: 'schedule',
        position: 0,
    },
    {
        id: '3',
        title: 'Refactor authentication module',
        description: 'Clean up legacy auth code',
        status: 'todo',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        priority_score: 35,
        eisenhower_category: 'schedule',
        position: 1,
    },
    {
        id: '4',
        title: 'Update project documentation',
        description: 'Document new API endpoints',
        status: 'review',
        due_date: null,
        priority_score: 20,
        eisenhower_category: 'delegate',
        position: 0,
    },
    {
        id: '5',
        title: 'Invoice Q4 clients',
        description: 'Send invoices for October-December work',
        status: 'todo',
        due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        priority_score: 85,
        eisenhower_category: 'do_first',
        position: 2,
    },
];

export default function TaskDashboard() {
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [activeView, setActiveView] = useState<'kanban' | 'calendar' | 'list'>('kanban');
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [classifyingTask, setClassifyingTask] = useState<string | null>(null);

    /**
     * Simulates AI classification with a delay.
     * In production, this would call the Server Action.
     */
    const handleClassifyTask = async (taskId: string) => {
        setClassifyingTask(taskId);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock AI response
        setTasks(current =>
            current.map(t =>
                t.id === taskId
                    ? {
                        ...t,
                        eisenhower_category: 'do_first',
                        priority_score: Math.floor(Math.random() * 30) + 70,
                    }
                    : t
            )
        );

        setClassifyingTask(null);
    };

    /**
     * Simulates drag-and-drop task movement.
     * In production, this would use dnd-kit and update Supabase.
     */
    const handleMoveTask = (taskId: string, newStatus: Task['status']) => {
        setTasks(current =>
            current.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
    };

    const columns: Task['status'][] = ['todo', 'in_progress', 'review', 'done'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Smart Task Manager</h1>
                        <p className="text-gray-600 mt-1">AI-powered prioritization for freelance developers</p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Task
                    </Button>
                </div>

                <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="kanban" className="gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Calendar
                        </TabsTrigger>
                        <TabsTrigger value="list" className="gap-2">
                            <List className="w-4 h-4" />
                            List
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="kanban" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {columns.map((status) => (
                                <KanbanColumn
                                    key={status}
                                    status={status}
                                    tasks={tasks.filter((t) => t.status === status)}
                                    onMoveTask={handleMoveTask}
                                    onClassifyTask={handleClassifyTask}
                                    classifyingTask={classifyingTask}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="calendar">
                        <CalendarView tasks={tasks} onClassifyTask={handleClassifyTask} classifyingTask={classifyingTask} />
                    </TabsContent>

                    <TabsContent value="list">
                        <ListView tasks={tasks} onClassifyTask={handleClassifyTask} classifyingTask={classifyingTask} />
                    </TabsContent>
                </Tabs>

                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                        <strong>Demo Mode:</strong> This is a fully functional UI demonstration. In production, tasks sync in real-time
                        via Supabase and AI classification uses Claude API. Click the sparkle icon on any task to simulate AI analysis.
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Kanban column component with simulated drag-and-drop.
 */
function KanbanColumn({
    status,
    tasks,
    onMoveTask,
    onClassifyTask,
    classifyingTask,
}: {
    status: Task['status'];
    tasks: Task[];
    onMoveTask: (taskId: string, newStatus: Task['status']) => void;
    onClassifyTask: (taskId: string) => void;
    classifyingTask: string | null;
}) {
    const columnLabels = {
        todo: 'To Do',
        in_progress: 'In Progress',
        review: 'Review',
        done: 'Done',
    };

    const columnColors = {
        todo: 'bg-gray-100',
        in_progress: 'bg-blue-100',
        review: 'bg-yellow-100',
        done: 'bg-green-100',
    };

    return (
        <div className={`${columnColors[status]} rounded-lg p-4 min-h-[600px]`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{columnLabels[status]}</h3>
                <Badge variant="secondary">{tasks.length}</Badge>
            </div>

            <div className="space-y-3">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onMoveTask={onMoveTask}
                        onClassifyTask={onClassifyTask}
                        isClassifying={classifyingTask === task.id}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Task card with urgency styling and simulated actions.
 */
function TaskCard({
    task,
    onMoveTask,
    onClassifyTask,
    isClassifying,
}: {
    task: Task;
    onMoveTask: (taskId: string, newStatus: Task['status']) => void;
    onClassifyTask: (taskId: string) => void;
    isClassifying: boolean;
}) {
    const getUrgencyStyles = () => {
        if (!task.due_date) return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900' };

        const hoursUntilDue = (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60);

        if (hoursUntilDue < 0) return { bg: 'bg-red-50', border: 'border-red-600 border-2', text: 'text-red-900 font-bold' };
        if (hoursUntilDue < 24) return { bg: 'bg-red-100', border: 'border-red-500 border-2', text: 'text-red-900 font-semibold' };
        if (hoursUntilDue < 72) return { bg: 'bg-orange-50', border: 'border-orange-500 border-2', text: 'text-orange-900 font-semibold' };
        if (hoursUntilDue < 168) return { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-900' };
        return { bg: 'bg-white', border: 'border-green-500', text: 'text-gray-900' };
    };

    const urgency = getUrgencyStyles();

    const getTimeRemaining = () => {
        if (!task.due_date) return null;
        const hoursUntilDue = (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntilDue < 0) return '⚠️ Overdue';
        if (hoursUntilDue < 24) return `🔥 ${Math.floor(hoursUntilDue)}h left`;
        const days = Math.floor(hoursUntilDue / 24);
        return `📅 ${days}d left`;
    };

    return (
        <div
            className={`
        ${urgency.bg} ${urgency.border}
        border rounded-lg p-4 transition-all hover:shadow-lg
        cursor-grab active:cursor-grabbing group
      `}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={`font-medium text-sm flex-1 ${urgency.text}`}>{task.title}</h4>
                <button
                    onClick={() => onClassifyTask(task.id)}
                    disabled={isClassifying}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Sparkles className={`w-4 h-4 ${isClassifying ? 'text-blue-600 animate-spin' : 'text-gray-400 hover:text-blue-600'}`} />
                </button>
            </div>

            {task.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-2 mb-3">
                {task.due_date && (
                    <Badge variant="outline" className="text-xs">
                        {getTimeRemaining()}
                    </Badge>
                )}
                {task.eisenhower_category && (
                    <Badge variant="secondary" className="text-xs">
                        {formatCategory(task.eisenhower_category)}
                    </Badge>
                )}
            </div>

            {task.priority_score !== null && (
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${getPriorityColor(task.priority_score)}`}
                            style={{ width: `${task.priority_score}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{task.priority_score}</span>
                </div>
            )}

            <div className="flex gap-1 flex-wrap">
                {(['todo', 'in_progress', 'review', 'done'] as const).map((newStatus) => (
                    newStatus !== task.status && (
                        <button
                            key={newStatus}
                            onClick={() => onMoveTask(task.id, newStatus)}
                            className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                            → {newStatus.replace('_', ' ')}
                        </button>
                    )
                ))}
            </div>

            {isClassifying && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    AI analyzing task...
                </div>
            )}
        </div>
    );
}

/**
 * Calendar view - groups tasks by due date.
 */
function CalendarView({
    tasks,
    onClassifyTask,
    classifyingTask,
}: {
    tasks: Task[];
    onClassifyTask: (taskId: string) => void;
    classifyingTask: string | null;
}) {
    const tasksWithDates = tasks.filter((t) => t.due_date).sort((a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    );

    const groupedByDate = tasksWithDates.reduce((acc, task) => {
        const date = new Date(task.due_date!).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Tasks by Due Date</h3>
            <div className="space-y-6">
                {Object.keys(groupedByDate).length === 0 ? (
                    <p className="text-gray-500">No tasks with due dates</p>
                ) : (
                    Object.entries(groupedByDate).map(([date, dateTasks]) => (
                        <div key={date} className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700 border-b pb-2">{date}</h4>
                            <div className="space-y-2">
                                {dateTasks.map((task) => (
                                    <div key={task.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-sm">{task.title}</h5>
                                                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">{task.status.replace('_', ' ')}</Badge>
                                                <button
                                                    onClick={() => onClassifyTask(task.id)}
                                                    disabled={classifyingTask === task.id}
                                                >
                                                    <Sparkles className={`w-4 h-4 ${classifyingTask === task.id ? 'text-blue-600 animate-spin' : 'text-gray-400 hover:text-blue-600'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/**
 * List view - sortable table of all tasks.
 */
function ListView({
    tasks,
    onClassifyTask,
    classifyingTask,
}: {
    tasks: Task[];
    onClassifyTask: (taskId: string) => void;
    classifyingTask: string | null;
}) {
    const [sortBy, setSortBy] = useState<'priority' | 'due_date'>('priority');

    const sortedTasks = [...tasks].sort((a, b) => {
        if (sortBy === 'priority') return b.priority_score - a.priority_score;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    return (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">All Tasks</h3>
                <div className="flex gap-2">
                    <Button
                        variant={sortBy === 'priority' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('priority')}
                    >
                        Sort by Priority
                    </Button>
                    <Button
                        variant={sortBy === 'due_date' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('due_date')}
                    >
                        Sort by Date
                    </Button>
                </div>
            </div>
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Task</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTasks.map((task) => (
                        <tr key={task.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div>
                                    <p className="font-medium text-sm">{task.title}</p>
                                    <p className="text-xs text-gray-600">{task.description}</p>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <Badge variant="secondary">{task.status.replace('_', ' ')}</Badge>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getPriorityColor(task.priority_score)}`}
                                            style={{ width: `${task.priority_score}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{task.priority_score}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => onClassifyTask(task.id)}
                                    disabled={classifyingTask === task.id}
                                >
                                    <Sparkles className={`w-4 h-4 ${classifyingTask === task.id ? 'text-blue-600 animate-spin' : 'text-gray-400 hover:text-blue-600'}`} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function formatCategory(category: string): string {
    const map: Record<string, string> = {
        do_first: '🔥 Do First',
        schedule: '📅 Schedule',
        delegate: '👥 Delegate',
        delete: '🗑️ Delete',
    };
    return map[category] || category;
}

function getPriorityColor(score: number): string {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
}