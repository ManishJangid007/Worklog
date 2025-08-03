import React, { useState } from 'react';
import { X, Copy, Edit, Trash2, Save, Clock, Check } from 'lucide-react';
import { DailyTask, Project, Task } from '../types';
import { databaseService } from '../services/database';

interface TaskDetailModalProps {
    dailyTask: DailyTask | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    dailyTask,
    isOpen,
    onClose,
    onUpdate
}) => {
    const [editing, setEditing] = useState(false);
    const [editedProjects, setEditedProjects] = useState<Project[]>([]);
    const [editedTasks, setEditedTasks] = useState<Task[]>([]);

    React.useEffect(() => {
        if (dailyTask) {
            setEditedProjects([...dailyTask.projects]);
            setEditedTasks([...dailyTask.tasks]);
        }
    }, [dailyTask]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    };

    const copyAllData = async () => {
        if (!dailyTask) return;

        const formattedData = `${dailyTask.date}\n${dailyTask.projects.map(project => {
            const projectTasks = dailyTask.tasks.filter(task => task.projectId === project.id);
            return `    - ${project.name}\n${projectTasks.map(task => `        - ${task.description}`).join('\n')}`;
        }).join('\n\n')}`;

        await copyToClipboard(formattedData);
    };

    const copyProjectBlock = async (project: Project) => {
        const projectTasks = dailyTask?.tasks.filter(task => task.projectId === project.id) || [];
        const taskWord = projectTasks.length === 1 ? 'Task' : 'Tasks';
        const formattedBlock = `${taskWord}\n    - ${projectTasks.map(task => task.description).join('\n    - ')}`;
        await copyToClipboard(formattedBlock);
    };

    const copyProjectTasks = async (project: Project) => {
        const projectTasks = dailyTask?.tasks.filter(task => task.projectId === project.id) || [];
        const formattedTasks = projectTasks.map(task => task.description).join(', ');
        await copyToClipboard(formattedTasks);
    };

    const handleSave = async () => {
        if (!dailyTask) return;

        try {
            const updatedDailyTask: DailyTask = {
                ...dailyTask,
                projects: editedProjects,
                tasks: editedTasks
            };

            await databaseService.saveDailyTask(updatedDailyTask);

            // Update individual tasks
            for (const task of editedTasks) {
                await databaseService.saveTask(task);
            }

            setEditing(false);
            onUpdate();
        } catch (error) {
            console.error('Failed to save changes:', error);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            await databaseService.deleteProject(projectId);
            setEditedProjects(editedProjects.filter(p => p.id !== projectId));
            setEditedTasks(editedTasks.filter(t => t.projectId !== projectId));
            onUpdate();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await databaseService.deleteTask(taskId);
            setEditedTasks(editedTasks.filter(t => t.id !== taskId));
            onUpdate();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const updateProjectHours = (projectId: string, hours: number) => {
        setEditedProjects(prev =>
            prev.map(p => p.id === projectId ? { ...p, hoursSpent: hours } : p)
        );
    };

    const updateTaskDescription = (taskId: string, description: string) => {
        setEditedTasks(prev =>
            prev.map(t => t.id === taskId ? { ...t, description } : t)
        );
    };

    const updateTaskCompletion = (taskId: string, completed: boolean) => {
        setEditedTasks(prev =>
            prev.map(t => t.id === taskId ? { ...t, completed } : t)
        );
    };

    if (!isOpen || !dailyTask) return null;

    return (
        <div className="modal-overlay">
            <div className="modal large">
                <div className="modal-header">
                    <div className="modal-header-left">
                        <h2>{formatDate(dailyTask.date)}</h2>
                    </div>
                    <div className="modal-header-right">
                        <button
                            className="icon-button"
                            onClick={copyAllData}
                            title="Copy all data"
                        >
                            <Copy size={20} />
                        </button>
                        <button className="close-button" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="modal-content">
                    {editedProjects.map(project => {
                        const projectTasks = editedTasks.filter(task => task.projectId === project.id);
                        return (
                            <div key={project.id} className="project-section">
                                <div className="project-header">
                                    <h3>{project.name}</h3>
                                    <div className="project-header-actions">
                                        <button
                                            className="icon-button"
                                            onClick={() => setEditing(!editing)}
                                            title={editing ? 'Cancel editing' : 'Edit'}
                                        >
                                            {editing ? <X size={16} /> : <Edit size={16} />}
                                        </button>
                                        {editing && (
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteProject(project.id)}
                                                title="Delete project"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="project-actions">
                                    <div className="hours-input">
                                        <Clock size={16} />
                                        <input
                                            type="number"
                                            placeholder="Hours spent"
                                            value={project.hoursSpent || ''}
                                            onChange={(e) => updateProjectHours(project.id, parseFloat(e.target.value) || 0)}
                                            className="form-input small"
                                            disabled={!editing}
                                        />
                                    </div>

                                    <div className="copy-buttons">
                                        <button
                                            className="copy-button"
                                            onClick={() => copyProjectBlock(project)}
                                            title="Copy project block"
                                        >
                                            Copy Block
                                        </button>
                                        <button
                                            className="copy-button"
                                            onClick={() => copyProjectTasks(project)}
                                            title="Copy tasks only"
                                        >
                                            Copy Tasks
                                        </button>
                                    </div>
                                </div>

                                <div className="tasks-list">
                                    {projectTasks.map(task => (
                                        <div key={task.id} className="task-item">
                                            <div className="task-content">
                                                <button
                                                    className={`task-checkbox ${task.completed ? 'completed' : ''}`}
                                                    onClick={() => updateTaskCompletion(task.id, !task.completed)}
                                                    title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                                >
                                                    {task.completed && <Check size={12} />}
                                                </button>
                                                {editing ? (
                                                    <input
                                                        type="text"
                                                        value={task.description}
                                                        onChange={(e) => updateTaskDescription(task.id, e.target.value)}
                                                        className={`form-input ${task.completed ? 'completed' : ''}`}
                                                    />
                                                ) : (
                                                    <span className={`task-description ${task.completed ? 'completed' : ''}`}>
                                                        {task.description}
                                                    </span>
                                                )}
                                            </div>
                                            {editing && (
                                                <button
                                                    className="delete-button small"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    title="Delete task"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {editing && (
                    <div className="modal-footer">
                        <button className="button secondary" onClick={() => setEditing(false)}>
                            Cancel
                        </button>
                        <button className="button primary" onClick={handleSave}>
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetailModal; 