import React from 'react';
import { Calendar, Clock, User, Paperclip, MessageSquare, MoreVertical } from 'lucide-react';
import { Task } from '../types';
import { formatDate, isOverdue, getPriorityColor, getTaskTypeIcon } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onMenuClick?: (taskId: number) => void;
  showMenu?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onMenuClick,
  showMenu,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },  
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTaskTypeIcon(task.taskType)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.(task.id);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <span>Edit Task</span>
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              <div className="px-3 py-1 text-xs font-medium text-gray-500">Change Status:</div>
              
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(status.value);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    task.status === status.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  {status.label} {task.status === status.value && '✓'}
                </button>
              ))}
              
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>

      <div onClick={onClick}>
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

        <div className="space-y-2">
          {(task.startDate || task.dueDate) && (
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {task.startDate && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Start: {formatDate(task.startDate)}</span>
                </div>
              )}
              {task.dueDate && (
                <div className={`flex items-center space-x-1 ${
                  isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-600' : ''
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {task.assignedTo.avatar}
                </span>
              </div>
              <span className="text-xs text-gray-600">{task.assignedTo.name}</span>
            </div>

            <div className="flex items-center space-x-3">
              {task.attachments > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Paperclip className="w-3 h-3" />
                  <span>{task.attachments}</span>
                </div>
              )}
              {task.comments > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MessageSquare className="w-3 h-3" />
                  <span>{task.comments}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;