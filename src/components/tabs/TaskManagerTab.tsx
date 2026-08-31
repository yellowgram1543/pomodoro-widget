import React, { useState } from 'react';
import { Plus, Check, Trash2, ListTodo, Play } from 'lucide-react';
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
    high: 'text-[#C84B31] bg-[#FBEBE8] border-[#F2C2BA]',
    medium: 'text-[#8E6F4E] bg-[#F4EFEA] border-[#DECFC0]',
    low: 'text-[#4A7C59] bg-[#EBF2ED] border-[#C2D8C9]',
  };

  return (
    <div className="flex flex-col w-full space-y-3.5">
      {/* Task Input Form with Enter to Add */}
      <form onSubmit={handleAddSubmit} className="space-y-2">
        <div className="flex items-center gap-2 p-1.5 bg-[#FCFAF6] border border-[#E2DBD0] rounded-xl focus-within:border-[#C84B31] transition-all shadow-sm">
          <input
            id="task-manager-new-input"
            type="text"
            placeholder="Add new task or chapter note... (press Enter)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent px-2.5 py-1 text-sm text-[#211F1C] placeholder-[#8F877A] focus:outline-none"
          />

          {/* Priority selector */}
          <select
            id="task-priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="bg-[#F0EAE1] border border-[#E2DBD0] text-[#5C564C] font-medium text-xs rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            id="btn-task-manager-add"
            type="submit"
            disabled={!newTitle.trim()}
            className="p-1.5 bg-[#C84B31] hover:bg-[#B53F27] disabled:opacity-40 disabled:hover:bg-[#C84B31] text-[#FCFAF6] rounded-lg transition-all shadow-sm"
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
                  ? 'bg-[#FCFAF6] text-[#211F1C] font-bold border border-[#E2DBD0] shadow-sm'
                  : 'text-[#6B645A] hover:text-[#211F1C]'
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
            className="flex items-center gap-1 text-[11px] text-[#8F877A] hover:text-[#C84B31] transition-colors"
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
          <div className="flex flex-col items-center justify-center py-8 text-[#8F877A] space-y-2 text-center">
            <ListTodo className="w-8 h-8 stroke-1 text-[#CFC5B6]" />
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
                    ? 'bg-[#F6F3EB]/60 border-[#E2DBD0]/60 opacity-60'
                    : 'bg-[#FCFAF6] hover:bg-[#F6F3EB] border-[#E2DBD0] shadow-[0_1px_3px_rgba(40,30,20,0.04)]'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Custom Styled Checkbox */}
                  <button
                    onClick={() => handleToggle(task.id, task.completed)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-[#4A7C59] border-[#3F6A4C] text-[#FCFAF6]'
                        : 'border-[#CFC5B6] hover:border-[#8F877A] bg-[#FCFAF6]'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs text-left truncate transition-all ${
                        task.completed
                          ? 'line-through text-[#8F877A]'
                          : 'text-[#211F1C] font-semibold'
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
                      className="p-1 text-[#8F877A] hover:text-[#C84B31] hover:bg-[#FBEBE8] rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Focus on this task"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-[#8F877A] hover:text-[#C84B31] hover:bg-[#FBEBE8] rounded transition-all opacity-0 group-hover:opacity-100"
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
      <div className="text-[10px] text-[#8F877A] flex items-center justify-between pt-1">
        <span>Auto-saved to local browser storage</span>
        <span>{tasks.length} total tasks</span>
      </div>
    </div>
  );
};
