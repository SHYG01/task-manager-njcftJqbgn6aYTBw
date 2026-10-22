import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';

type Priority = 'high' | 'medium' | 'low';

interface Task {
  id: string;
  title: string;
  priority: Priority;
  is_completed: boolean;
  _created_at: string;
}

const priorityLabel: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const priorityBadge: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<string>('all');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*')
      .order('_created_at', { ascending: false });
    if (filter !== 'all') {
      query = query.eq('priority', filter);
    }
    const { data, error } = await query;
    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAdd = async () => {
    if (!title.trim()) return;
    const { error } = await supabase
      .from('tasks')
      .insert({ title: title.trim(), priority, is_completed: false });
    if (!error) {
      setTitle('');
      setPriority('medium');
      fetchTasks();
    }
  };

  const handleToggle = async (task: Task) => {
    await supabase
      .from('tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id);
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">智能任务管理</h1>
        <p className="text-sm text-slate-500 mb-6">高效管理你的日常待办</p>

        {/* 添加任务 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <h2 className="text-base font-semibold text-slate-700 mb-3">添加新任务</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="请输入任务标题"
              className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="h-10 px-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
            <button
              onClick={handleAdd}
              className="h-10 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + 添加
            </button>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-700">
              任务列表
              {!loading && <span className="ml-2 text-sm font-normal text-slate-400">共 {tasks.length} 条</span>}
            </h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 px-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="all">全部</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-400 text-sm">加载中...</p>
          ) : tasks.length === 0 ? (
            <p className="py-8 text-center text-slate-400 text-sm">暂无任务</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  <button
                    onClick={() => handleToggle(task)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      task.is_completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {task.is_completed && '✓'}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      task.is_completed ? 'line-through text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${priorityBadge[task.priority]}`}
                  >
                    {priorityLabel[task.priority]}
                  </span>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-slate-400 hover:text-red-500 text-sm"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
