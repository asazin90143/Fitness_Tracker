# Smart Task Manager

An AI-powered task management SaaS built for freelance developers and small teams. Features real-time collaboration, intelligent prioritization using the Eisenhower Matrix, and a hybrid dashboard with Kanban, Calendar, and List views.

## Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Actions)
- **Database**: Supabase (PostgreSQL, Real-time, Auth)
- **UI**: shadcn/ui (Radix UI) + Tailwind CSS
- **Drag & Drop**: dnd-kit
- **AI**: Anthropic Claude (via AI SDK)
- **Language**: TypeScript

## Features

### 🎯 AI-Powered Prioritization
- Automatic task classification using Eisenhower Matrix (Do First, Schedule, Delegate, Delete)
- Context-aware analysis for freelance web development workflows
- Priority scoring (0-100) based on urgency, importance, and business context

### 📊 Hybrid Dashboard
- **Kanban Board**: Drag-and-drop tasks across status columns with real-time updates
- **Calendar View**: Visualize tasks by due date
- **List View**: Sortable table with all task details

### ⚡ Real-Time Collaboration
- Live updates across all connected clients using Supabase Realtime
- Instant synchronization when tasks are created, moved, or updated
- Row Level Security ensures users only see authorized data

### 🎨 Visual Urgency System
- Color-coded task cards based on deadline proximity:
  - **Red** (< 24 hours): Critical, drop everything
  - **Orange** (< 3 days): Urgent, prioritize today
  - **Yellow** (< 7 days): Schedule focused work blocks
  - **Green** (> 7 days): Normal workflow

## Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

## Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd smart-task-manager

# Install dependencies
npm install
```

### 2. Configure Supabase

Create a new Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard).

**Copy your project credentials:**
- Project URL: `https://your-project.supabase.co`
- Anon/Public Key: Found in Settings > API
- Service Role Key: Found in Settings > API (keep this secret!)

**Run the database schema:**

1. Open Supabase SQL Editor (Dashboard > SQL Editor)
2. Copy the contents of `supabase-schema.sql`
3. Execute the SQL script

This will create all tables, indexes, RLS policies, and enable real-time subscriptions.

### 3. Configure Anthropic AI

Get your API key from [console.anthropic.com](https://console.anthropic.com).

### 4. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Security Notes:**
- Never commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS policies—only use in Server Actions
- The anon key is safe to expose in client code (protected by RLS)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
smart-task-manager/
├── app/
│   ├── actions/
│   │   └── classify-task.ts      # AI classification Server Action
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── page.tsx           # Main dashboard page
│   └── layout.tsx
├── components/
│   ├── dashboard/
│   │   └── task-dashboard.tsx    # Hybrid view component with dnd-kit
│   ├── task-card.tsx              # Reusable task card with urgency styling
│   └── ui/                        # shadcn components (auto-generated)
├── lib/
│   ├── supabase/
│   │   ├── server.ts              # Server Component client
│   │   └── client.ts              # Client Component client
│   ├── types/
│   │   └── database.ts            # TypeScript types matching DB schema
│   ├── validations/
│   │   └── task.ts                # Zod schemas for task operations
│   └── utils/
│       └── task-urgency.ts        # Visual urgency calculation
├── supabase-schema.sql            # Complete database schema
└── README.md
```

## Key Concepts

### Row Level Security (RLS)

All database tables use RLS policies to ensure:
- Users only see projects they own or are team members of
- Tasks are only visible within authorized projects
- Real-time subscriptions respect these permissions

The policies are defined in `supabase-schema.sql` and automatically enforced by Supabase.

### Real-Time Updates

The dashboard subscribes to Postgres changes:

```typescript
supabase
  .channel('tasks-channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, handler)
  .subscribe()
```

When ANY client updates a task (or the AI classifies it), all connected clients receive the update instantly. This enables true collaborative editing.

### AI Classification Flow

1. User creates/updates a task
2. UI shows "Analyzing..." badge (optimistic UI)
3. Server Action sends task context to Claude AI
4. Claude analyzes based on freelance web dev context
5. Returns Eisenhower category + priority score
6. Server Action updates Supabase
7. Real-time subscription broadcasts to all clients

The prompt in `classify-task.ts` explicitly defines what "important" means for freelance developers (client deliverables > refactoring).

### dnd-kit Integration

The drag-and-drop system uses:
- **Sensors**: Detect and control drag interactions
- **Sortable**: Enable reordering within lists
- **DragOverlay**: Visual feedback during drag
- **Optimistic Updates**: Immediate UI response before DB confirmation

The 8px activation distance prevents accidental drags on mobile/trackpad.

## Development Workflow

### Adding a New Task

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const { data, error } = await supabase
  .from('tasks')
  .insert({
    title: 'Build payment integration',
    project_id: 'project-uuid',
    created_by: user.id,
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  })
  .select()
  .single()
```

### Triggering AI Classification

```typescript
import { classifyTask } from '@/app/actions/classify-task'

const result = await classifyTask({
  taskId: task.id,
  title: task.title,
  description: task.description,
  dueDate: task.due_date,
  manualPriority: task.manual_priority,
})

if (result.success) {
  console.log('Category:', result.eisenhower_category)
  console.log('Score:', result.priority_score)
}
```

### Testing Real-Time Updates

1. Open the dashboard in two browser windows
2. Drag a task in Window 1
3. Window 2 instantly reflects the change

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in project settings
4. Deploy

Vercel automatically handles Next.js App Router requirements.

### Environment Variables for Production

Ensure these are set in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

## Customization

### Adjusting Urgency Thresholds

Edit `lib/utils/task-urgency.ts`:

```typescript
// Change from 24 hours to 12 hours for critical
if (hoursRemaining < 12) {
  return { level: 'critical', /* ... */ }
}
```

### Modifying AI Context

Edit `app/actions/classify-task.ts` in the `buildClassificationPrompt` function:

```typescript
CONTEXT: Your Business Context Here
- High Importance: Your priorities
- Low Importance: Your low-priority items
```

### Adding Custom Task Fields

1. Add column to `tasks` table in Supabase
2. Update `lib/types/database.ts`
3. Update Zod schema in `lib/validations/task.ts`
4. Add field to TaskCard component

## Troubleshooting

### Real-time updates not working

1. Verify you ran: `ALTER PUBLICATION supabase_realtime ADD TABLE tasks;`
2. Check RLS policies allow SELECT on tasks
3. Confirm Realtime is enabled in Supabase Dashboard > Database > Replication

### AI classification failing

1. Verify `ANTHROPIC_API_KEY` is set correctly
2. Check Server Action logs in terminal
3. Ensure task exists and user has access (RLS)
4. Test Claude API directly: `curl https://api.anthropic.com/v1/messages -H "x-api-key: $ANTHROPIC_API_KEY"`

### Drag-and-drop not working

1. Ensure `dnd-kit` packages are installed
2. Check browser console for errors
3. Verify `DndContext` wraps `SortableContext`
4. Test on desktop (mobile requires different sensors)

## License

MIT

## Support

For issues or questions, open a GitHub issue or contact the maintainer.