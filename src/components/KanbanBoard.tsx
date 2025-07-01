import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Task, TaskList } from '../types';
import { mockTasks, mockUsers } from '../data/mockData';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  projectId: number;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  onTaskClick,
  onAddTask
}) => {
  const [showTaskMenu, setShowTaskMenu] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get tasks for this project
  const projectTasks = mockTasks.filter(task => task.projectId === projectId);

  // Define task lists with their corresponding statuses
  const taskLists: TaskList[] = [
    {
      id: 1,
      name: 'To Do',
      color: 'bg-gray-100',
      tasks: projectTasks.filter(task => task.status === 'todo'),
      order: 1
    },
    {
      id: 2,
      name: 'In Progress',
      color: 'bg-blue-100',
      tasks: projectTasks.filter(task => task.status === 'in-progress'),
      order: 2
    },
    {
      id: 3,
      name: 'Review',
      color: 'bg-yellow-100',
      tasks: projectTasks.filter(task => task.status === 'review'),
      order: 3
    },
    {
      id: 4,
      name: 'Overdue',
      color: 'bg-red-100',
      tasks: projectTasks.filter(task => task.status === 'overdue'),
      order: 4
    },
    {
      id: 5,
      name: 'Done',
      color: 'bg-green-100',
      tasks: projectTasks.filter(task => task.status === 'done'),
      order: 5
    }
  ];

  // Filter lists based on status filter
  const getFilteredLists = () => {
    if (statusFilter === 'all') {
      return taskLists.filter(list => list.name !== 'Done' || statusFilter === 'all');
    } else if (statusFilter === 'done') {
      return taskLists.filter(list => list.name === 'Done');
    } else {
      return taskLists.filter(list => 
        list.name.toLowerCase().replace(/\s+/g, '-') === statusFilter
      );
    }
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    // In a real app, this would update the task in the backend
    console.log(`Changing task ${taskId} to status: ${newStatus}`);
    setShowTaskMenu(null);
  };

  const handleDeleteTask = (taskId: number) => {
    // In a real app, this would delete the task from the backend
    console.log(`Deleting task ${taskId}`);
    setShowTaskMenu(null);
  };

  // Calculate stats for filter buttons
  const stats = {
    review: taskLists.find(list => list.name === 'Review')?.tasks.length || 0,
    overdue: taskLists.find(list => list.name === 'Overdue')?.tasks.length || 0,
    'in-progress': taskLists.find(list => list.name === 'In Progress')?.tasks.length || 0,
    'to-do': taskLists.find(list => list.name === 'To Do')?.tasks.length || 0,
    done: taskLists.find(list => list.name === 'Done')?.tasks.length || 0
  };

  return (
    <div className="space-y-6">
      {/* Filter Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-4">
          {[
            { key: 'review', label: 'Review', color: 'bg-yellow-50 border-yellow-300 text-yellow-800' },
            { key: 'overdue', label: 'Overdue', color: 'bg-red-50 border-red-300 text-red-800' },
            { key: 'in-progress', label: 'In Progress', color: 'bg-blue-50 border-blue-300 text-blue-800' },
            { key: 'to-do', label: 'To Do', color: 'bg-gray-50 border-gray-300 text-gray-800' },
            { key: 'done', label: 'Done', color: 'bg-green-50 border-green-300 text-green-800' }
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              className={`text-center transition-all duration-200 p-3 rounded-lg border-2 ${
                statusFilter === key ? color + ' shadow-sm' : 'hover:bg-gray-50 border-transparent'
              }`}
            >
              <div className="text-2xl font-bold mb-1">
                {stats[key as keyof typeof stats]}
              </div>
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>

        {statusFilter !== 'all' && (
          <div className="mt-4 flex items-center justify-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
              <span className="text-blue-800 text-sm font-medium">
                Viewing: {statusFilter.replace('-', ' ')} tasks only
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      {statusFilter === 'all' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {getFilteredLists().map((list) => (
            <div key={list.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className={`px-4 py-3 rounded-t-lg border-b border-gray-200 ${list.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{list.name}</h3>
                  <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                    {list.tasks.length}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3 min-h-[500px]">
                {list.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onMenuClick={(taskId) => setShowTaskMenu(showTaskMenu === taskId ? null : taskId)}
                    showMenu={showTaskMenu === task.id}
                    onEdit={() => onTaskClick(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    onStatusChange={(status) => handleStatusChange(task.id, status)}
                  />
                ))}

                <button
                  onClick={onAddTask}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view for filtered tasks
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {statusFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Tasks 
                ({getFilteredLists().reduce((total, list) => total + list.tasks.length, 0)})
              </h2>
              <button
                onClick={onAddTask}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {getFilteredLists()
              .flatMap(list => list.tasks)
              .map((task) => (
                <div
                  key={task.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <TaskCard
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onMenuClick={(taskId) => setShowTaskMenu(showTaskMenu === taskId ? null : taskId)}
                    showMenu={showTaskMenu === task.id}
                    onEdit={() => onTaskClick(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    onStatusChange={(status) => handleStatusChange(task.id, status)}
                  />
                </div>
              ))}

            {getFilteredLists().every(list => list.tasks.length === 0) && (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {statusFilter.replace('-', ' ')} tasks
                </h3>
                <p className="text-gray-500 mb-4">Create a task to get started</p>
                <button
                  onClick={onAddTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showTaskMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowTaskMenu(null)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;