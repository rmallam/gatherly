import React, { useState } from 'react';
import { CheckSquare, Plus, X, Check, Trash2, Calendar, AlertCircle } from 'lucide-react';

const TasksTab = ({ event, onUpdateTasks }) => {
    const [tasks, setTasks] = useState(event.tasks || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        category: 'planning',
        priority: 'medium',
        deadline: '',
        status: 'not-started'
    });

    const categories = [
        { id: 'planning', label: 'Planning', emoji: '📝' },
        { id: 'booking', label: 'Booking', emoji: '📞' },
        { id: 'day-of', label: 'Day-of Event', emoji: '🎯' },
        { id: 'post-event', label: 'Post-Event', emoji: '📦' }
    ];

    const priorities = [
        { id: 'high', label: 'High', color: 'var(--error)' },
        { id: 'medium', label: 'Medium', color: 'var(--warning)' },
        { id: 'low', label: 'Low', color: 'var(--success)' }
    ];

    const statuses = [
        { id: 'not-started', label: 'Not Started', color: 'var(--text-tertiary)' },
        { id: 'in-progress', label: 'In Progress', color: 'var(--warning)' },
        { id: 'completed', label: 'Completed', color: 'var(--success)' }
    ];

    const handleAddTask = () => {
        if (!newTask.title) return;

        const task = {
            id: Date.now().toString(),
            ...newTask,
            createdAt: new Date().toISOString()
        };

        const updatedTasks = [...tasks, task];
        setTasks(updatedTasks);
        onUpdateTasks?.(updatedTasks);
        setNewTask({ title: '', category: 'planning', priority: 'medium', deadline: '', status: 'not-started' });
        setShowAddForm(false);
    };

    const handleDeleteTask = (id) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        setTasks(updatedTasks);
        onUpdateTasks?.(updatedTasks);
    };

    const handleUpdateStatus = (id, newStatus) => {
        const updatedTasks = tasks.map(task =>
            task.id === id ? { ...task, status: newStatus } : task
        );
        setTasks(updatedTasks);
        onUpdateTasks?.(updatedTasks);
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Get overdue tasks
    const overdueTasks = tasks.filter(t => {
        if (!t.deadline || t.status === 'completed') return false;
        return new Date(t.deadline) < new Date();
    });

    return (
        <div>
            {/* Add Task Button */}
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-primary"
                style={{ marginBottom: '1.5rem' }}
            >
                <Plus size={16} /> Add Task
            </button>

            {/* Add Form */}
            {showAddForm && (
                <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>New Task</h3>
                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Task Title*</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="e.g., Book photographer"
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Category</label>
                                <select
                                    className="form-input"
                                    value={newTask.category}
                                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Priority</label>
                                <select
                                    className="form-input"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    {priorities.map(p => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Deadline (Optional)</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={newTask.deadline}
                                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleAddTask} className="btn btn-primary">
                            <Check size={16} /> Add Task
                        </button>
                        <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tasks</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalTasks}</div>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{completedTasks}</div>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Progress</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{inProgressTasks}</div>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overdue</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error)' }}>{overdueTasks.length}</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Overall Progress</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {completionPercentage.toFixed(0)}%
                    </span>
                </div>
                <div style={{ height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${completionPercentage}%`,
                        background: 'linear-gradient(90deg, var(--success) 0%, #059669 100%)',
                        transition: 'width 0.5s ease',
                        borderRadius: '999px'
                    }}></div>
                </div>
            </div>


            {/* Tasks by Category */}
            {categories.map(category => {
                const categoryTasks = tasks.filter(task => task.category === category.id);
                if (categoryTasks.length === 0) return null;

                return (
                    <div key={category.id} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <span>{category.emoji}</span>
                            {category.label}
                            <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.75rem', borderRadius: '12px', color: 'var(--text-secondary)' }}>{categoryTasks.length}</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {categoryTasks.map(task => {
                                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';
                                const priorityColor = priorities.find(p => p.id === task.priority)?.color;

                                return (
                                    <div
                                        key={task.id}
                                        style={{
                                            padding: '1rem 0.5rem',
                                            transition: 'all 0.2s',
                                            borderRadius: '8px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</h4>
                                                    <span style={{
                                                        padding: '0.125rem 0.5rem',
                                                        background: `${priorityColor}15`,
                                                        color: priorityColor,
                                                        borderRadius: '12px',
                                                        fontSize: '0.6875rem',
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                        border: `1px solid ${priorityColor}30`
                                                    }}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {task.deadline && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isOverdue ? 'var(--error)' : 'inherit' }}>
                                                            <Calendar size={12} />
                                                            {new Date(task.deadline).toLocaleDateString()}
                                                            {isOverdue && ' (Overdue)'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        borderRadius: '20px',
                                                        border: 'none',
                                                        background: 'var(--bg-secondary)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: statuses.find(s => s.id === task.status)?.color,
                                                        cursor: 'pointer',
                                                        appearance: 'none',
                                                        outline: 'none',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {statuses.map(status => (
                                                        <option key={status.id} value={status.id}>{status.label}</option>
                                                    ))}
                                                </select>

                                                <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: 0.8 }}>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="action-btn"
                                                        style={{
                                                            padding: '0.5rem',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: 'var(--text-secondary)',
                                                            cursor: 'pointer',
                                                            borderRadius: '8px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <style jsx>{`
                                                div:hover > div > div.flex { opacity: 1 !important; }
                                            `}</style>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Empty State */}
            {tasks.length === 0 && !showAddForm && (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                        color: 'var(--text-tertiary)'
                    }}>
                        <CheckSquare size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        No Tasks Yet
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Start organizing your event with a task checklist
                    </p>
                    <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
                        <Plus size={16} /> Add First Task
                    </button>
                </div>
            )}
        </div>
    );
};

export default TasksTab;
