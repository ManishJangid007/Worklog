import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Project, DailyTask } from '../types';
import { databaseService } from '../services/database';
import { v4 as uuidv4 } from 'uuid';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dailyTask: DailyTask) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    const [tasks, setTasks] = useState<{ id: string; description: string; projectId: string }[]>([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen]);

    const loadProjects = async () => {
        try {
            const allProjects = await databaseService.getAllProjects();
            setProjects(allProjects);
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    };

    const handleAddProject = async () => {
        if (!newProjectName.trim()) return;

        const project: Project = {
            id: uuidv4(),
            name: newProjectName.trim()
        };

        try {
            await databaseService.saveProject(project);
            setProjects([...projects, project]);
            setSelectedProject(project.id);
            setNewProjectName('');
        } catch (error) {
            console.error('Failed to add project:', error);
        }
    };

    const handleAddTask = () => {
        if (!newTask.trim() || !selectedProject) return;

        const task = {
            id: uuidv4(),
            description: newTask.trim(),
            projectId: selectedProject
        };

        setTasks([...tasks, task]);
        setNewTask('');
    };

    const handleRemoveTask = (taskId: string) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const handleSave = async () => {
        if (tasks.length === 0) return;

        const dailyTask: DailyTask = {
            id: uuidv4(),
            date,
            projects: projects.filter(p => tasks.some(t => t.projectId === p.id)),
            tasks: tasks.map(task => ({
                ...task,
                date
            }))
        };

        try {
            // Save daily task
            await databaseService.saveDailyTask(dailyTask);

            // Save individual tasks
            for (const task of tasks) {
                await databaseService.saveTask({
                    ...task,
                    date
                });
            }

            onSave(dailyTask);
            onClose();
            resetForm();
        } catch (error) {
            console.error('Failed to save tasks:', error);
        }
    };

    const resetForm = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setSelectedProject('');
        setNewProjectName('');
        setTasks([]);
        setNewTask('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Add Tasks</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Project</label>
                        <div className="project-selector">
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select a project</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>

                            <div className="new-project-input">
                                <input
                                    type="text"
                                    placeholder="New project name"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="form-input"
                                />
                                <button
                                    className="add-button"
                                    onClick={handleAddProject}
                                    disabled={!newProjectName.trim()}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tasks</label>
                        <div className="task-input">
                            <input
                                type="text"
                                placeholder="Enter task description"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className="form-input"
                                disabled={!selectedProject}
                            />
                            <button
                                className="add-button"
                                onClick={handleAddTask}
                                disabled={!newTask.trim() || !selectedProject}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {tasks.length > 0 && (
                        <div className="tasks-list">
                            <h3>Added Tasks</h3>
                            {tasks.map(task => {
                                const project = projects.find(p => p.id === task.projectId);
                                return (
                                    <div key={task.id} className="task-item">
                                        <span className="task-description">{task.description}</span>
                                        <span className="task-project">{project?.name}</span>
                                        <button
                                            className="remove-button"
                                            onClick={() => handleRemoveTask(task.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="button secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="button primary"
                        onClick={handleSave}
                        disabled={tasks.length === 0}
                    >
                        Save Tasks
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal; 