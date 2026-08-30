import React, { useState } from 'react';
import { Plus, Check, Trash2, ListTodo, Play, Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, TaskPriority } from '../../types';

interface TaskManagerTabProps {
  tasks: Task[];
  onAddTask: (title: string, priority: TaskPriority) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
  onFocusTask: (task: Task) => void;
}

export const TaskManagerTab: React.FC<TaskManagerTabProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
  onFocusTask,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTitle.trim()) {
      e.preventDefault();
      onAddTask(newTitle.trim(), priority);
      setNewTitle('');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddTask(newTitle.trim(), priority);
      setNewTitle('');
    }
  };

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    onToggleTask(id);
    if (!currentlyCompleted) {
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.length - completedCount;

  const priorityColors = {
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    low: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  };

  return (
    <div className="flex flex-col w-full space-y-3.5">
      {/* Task Input Form with Enter to Add */}
      <form onSubmit={handleAddSubmit} className="space-y-2">
        <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-amber-400/50 transition-all">
          <input
            id="task-manager-new-input"
            type="text"
            placeholder="Add new task... (press Enter)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent px-2.5 py-1 text-sm text-white placeholder-neutral-500 focus:outline-none"
          />

          {/* Priority selector */}
          <select
            id="task-priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="bg-neutral-800 border border-white/10 text-neutral-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            id="btn-task-manager-add"
            type="submit"
            disabled={!newTitle.trim()}
            className="p-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-neutral-950 rounded-lg transition-all"
            title="Add task"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </form>

      {/* Filter & Counter Bar */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-1">
          {(['all', 'active', 'completed'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                filter === mode
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {mode} {mode === 'active' ? `(${activeCount})` : mode === 'completed' ? `(${completedCount})` : `(${tasks.length})`}
            </button>
          ))}
        </div>

        {completedCount > 0 && (
          <button
            id="btn-task-manager-clear-completed"
            onClick={onClearCompleted}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-400 transition-colors"
            title="Flush finished items"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed</span>
          </button>
        )}
      </div>

      {/* Task List Items Container */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-neutral-500 space-y-2 text-center">
            <ListTodo className="w-8 h-8 stroke-1 text-neutral-600" />
            <p className="text-xs">
              {filter === 'completed'
                ? 'No completed tasks yet.'
                : filter === 'active'
                ? 'All caught up! Time to relax or add a new goal.'
                : 'No tasks added. Type above and press Enter!'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-white/[0.02] border-white/5 opacity-50'
                    : 'bg-white/5 hover:bg-white/[0.08] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Custom Styled Checkbox */}
                  <button
                    onClick={() => handleToggle(task.id, task.completed)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-400 text-neutral-950'
                        : 'border-white/30 hover:border-white/60 bg-white/5'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs text-left truncate transition-all ${
                        task.completed
                          ? 'line-through text-neutral-400'
                          : 'text-neutral-100 font-medium'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span
                    className={`px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded border ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>

                  {!task.completed && (
                    <button
                      onClick={() => onFocusTask(task)}
                      className="p-1 text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Focus on this task"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Persistence Note */}
      <div className="text-[10px] text-neutral-500 flex items-center justify-between pt-1">
        <span>Auto-saved to local browser storage</span>
        <span>{tasks.length} total tasks</span>
      </div>
    </div>
  );
};
