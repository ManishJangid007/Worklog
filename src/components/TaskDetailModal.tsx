import React, { useState } from 'react';
import { X, Copy, Edit, Trash2, Save, Clock, Check, Plus, RotateCcw } from 'lucide-react';
import { DailyTask, Project, Task } from '../types';
import { databaseService } from '../services/database';
import { v4 as uuidv4 } from 'uuid';

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
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editedProjects, setEditedProjects] = useState<Project[]>([]);
    const [editedTasks, setEditedTasks] = useState<Task[]>([]);
    const [newTaskInputs, setNewTaskInputs] = useState<{ [projectId: string]: string }>({});
    const [showNewSectionInput, setShowNewSectionInput] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [showSectionDropdown, setShowSectionDropdown] = useState(false);
    const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

    // Predefined sections
    const predefinedSections = [
        'Development',
        'Design',
        'Testing',
        'Documentation',
        'Meeting',
        'Research',
        'Planning',
        'Review',
        'Bug Fix',
        'Feature',
        'Refactor',
        'Deployment'
    ];

    React.useEffect(() => {
        if (dailyTask) {
            setEditedProjects([...dailyTask.projects]);
            // Ensure all tasks have the completed field properly initialized
            const tasksWithCompletion = dailyTask.tasks.map(task => ({
                ...task,
                completed: task.completed ?? false
            }));
            setEditedTasks(tasksWithCompletion);
        }
    }, [dailyTask]);

    // Load available projects from database
    React.useEffect(() => {
        const loadProjects = async () => {
            try {
                const projects = await databaseService.getAllProjects();
                setAvailableProjects(projects);
            } catch (error) {
                console.error('Failed to load projects:', error);
            }
        };
        loadProjects();
    }, []);

    // Reset edit mode when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setEditing(false);
            setShowNewSectionInput(false);
            setShowSectionDropdown(false);
            setNewSectionName('');
            setNewTaskInputs({});
        }
    }, [isOpen]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const copyToClipboard = async (text: string, buttonElement?: HTMLElement) => {
        try {
            await navigator.clipboard.writeText(text);

            // Add animation class to button
            if (buttonElement) {
                buttonElement.classList.add('copy-animation');
                setTimeout(() => {
                    buttonElement.classList.remove('copy-animation');
                }, 500);
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            // Add animation even for fallback
            if (buttonElement) {
                buttonElement.classList.add('copy-animation');
                setTimeout(() => {
                    buttonElement.classList.remove('copy-animation');
                }, 500);
            }
        }
    };

    const copyAllData = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!dailyTask) return;

        const formattedData = `${dailyTask.date}\n${editedProjects.map(project => {
            const projectTasks = editedTasks.filter(task => task.projectId === project.id);
            return `    - ${project.name}\n${projectTasks.map(task => `        - ${task.description}`).join('\n')}`;
        }).join('\n\n')}`;

        await copyToClipboard(formattedData, event.currentTarget);
    };

    const copyProjectBlock = async (project: Project, event: React.MouseEvent<HTMLButtonElement>) => {
        const projectTasks = editedTasks.filter(task => task.projectId === project.id);
        const taskWord = projectTasks.length === 1 ? 'Task' : 'Tasks';
        const formattedBlock = `${taskWord}\n    - ${projectTasks.map(task => task.description).join('\n    - ')}`;
        await copyToClipboard(formattedBlock, event.currentTarget);
    };

    const copyProjectTasks = async (project: Project, event: React.MouseEvent<HTMLButtonElement>) => {
        const projectTasks = editedTasks.filter(task => task.projectId === project.id);
        const formattedTasks = projectTasks.map(task => task.description).join(', ');
        await copyToClipboard(formattedTasks, event.currentTarget);
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
            onUpdate(); // This will refresh the home screen
        } catch (error) {
            console.error('Failed to save changes:', error);
        }
    };

    const handleCancel = () => {
        if (dailyTask) {
            setEditedProjects([...dailyTask.projects]);
            // Ensure all tasks have the completed field properly initialized
            const tasksWithCompletion = dailyTask.tasks.map(task => ({
                ...task,
                completed: task.completed ?? false
            }));
            setEditedTasks(tasksWithCompletion);
        }
        setEditing(false);
        setShowNewSectionInput(false);
        setShowSectionDropdown(false);
        setNewSectionName('');
        setNewTaskInputs({});
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

    const updateTaskCompletion = async (taskId: string, completed: boolean) => {
        const updatedTasks = editedTasks.map(t =>
            t.id === taskId ? { ...t, completed } : t
        );
        setEditedTasks(updatedTasks);

        // Save to database immediately
        try {
            const updatedTask = updatedTasks.find(task => task.id === taskId);
            if (updatedTask) {
                await databaseService.saveTask(updatedTask);
            }
        } catch (error) {
            console.error('Failed to save task completion:', error);
        }
    };

    const handleEditProject = (project: Project) => {
        if (editingProjectId === project.id) {
            setEditingProjectId(null);
        } else {
            setEditingProjectId(project.id);
        }
    };

    const addNewSection = async (sectionName?: string) => {
        const nameToAdd = sectionName || newSectionName.trim();
        if (!nameToAdd) return;

        // Check if project already exists in available projects
        let existingProject = availableProjects.find(p => p.name.toLowerCase() === nameToAdd.toLowerCase());

        if (!existingProject) {
            // Create new project if it doesn't exist
            const newProject: Project = {
                id: uuidv4(),
                name: nameToAdd
            };

            try {
                await databaseService.saveProject(newProject);
                setAvailableProjects([...availableProjects, newProject]);
                existingProject = newProject;
            } catch (error) {
                console.error('Failed to create new project:', error);
                return;
            }
        }

        // Add to current daily task if not already present
        if (!editedProjects.find(p => p.id === existingProject!.id)) {
            setEditedProjects([...editedProjects, existingProject!]);
        }

        setNewSectionName('');
        setShowNewSectionInput(false);
        setShowSectionDropdown(false);
    };

    const addNewTask = async (projectId: string) => {
        const taskDescription = newTaskInputs[projectId];
        if (!taskDescription?.trim()) return;

        const newTask: Task = {
            id: uuidv4(),
            description: taskDescription.trim(),
            projectId,
            date: dailyTask?.date || '',
            completed: false
        };

        try {
            await databaseService.saveTask(newTask);
            setEditedTasks([...editedTasks, newTask]);
            setNewTaskInputs(prev => ({ ...prev, [projectId]: '' }));
        } catch (error) {
            console.error('Failed to add new task:', error);
        }
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
                        <button
                            className="icon-button"
                            onClick={() => editing ? handleCancel() : setEditing(true)}
                            title={editing ? 'Cancel editing' : 'Edit'}
                        >
                            {editing ? <RotateCcw size={20} /> : <Edit size={20} />}
                        </button>
                        <button className="close-button" onClick={() => {
                            setEditing(false);
                            setShowNewSectionInput(false);
                            setShowSectionDropdown(false);
                            setNewSectionName('');
                            setNewTaskInputs({});
                            onClose();
                        }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="modal-content">
                    {/* Add New Section - Only in Edit Mode */}
                    {editing && (
                        <div className="add-section-container">
                            {!showNewSectionInput && !showSectionDropdown ? (
                                <div className="add-section-buttons">
                                    <button
                                        className="add-section-btn"
                                        onClick={() => setShowSectionDropdown(true)}
                                    >
                                        <Plus size={16} />
                                        Choose Project
                                    </button>
                                    <button
                                        className="add-section-btn custom"
                                        onClick={() => setShowNewSectionInput(true)}
                                    >
                                        <Plus size={16} />
                                        Custom Project
                                    </button>
                                </div>
                            ) : showSectionDropdown ? (
                                <div className="section-dropdown">
                                    <div className="dropdown-header">
                                        <h4>Choose a project</h4>
                                        <button
                                            className="close-button"
                                            onClick={() => setShowSectionDropdown(false)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="predefined-sections">
                                        {availableProjects.length > 0 ? (
                                            availableProjects.map(project => (
                                                <button
                                                    key={project.id}
                                                    className="section-option"
                                                    onClick={() => addNewSection(project.name)}
                                                >
                                                    {project.name}
                                                </button>
                                            ))
                                        ) : (
                                            predefinedSections.map(section => (
                                                <button
                                                    key={section}
                                                    className="section-option"
                                                    onClick={() => addNewSection(section)}
                                                >
                                                    {section}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="new-section-input">
                                    <input
                                        type="text"
                                        placeholder="Enter custom project name"
                                        value={newSectionName}
                                        onChange={(e) => setNewSectionName(e.target.value)}
                                        className="form-input"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                addNewSection();
                                            }
                                        }}
                                    />
                                    <button
                                        className="add-button"
                                        onClick={() => addNewSection()}
                                        disabled={!newSectionName.trim()}
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        className="cancel-button"
                                        onClick={() => {
                                            setShowNewSectionInput(false);
                                            setNewSectionName('');
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {editedProjects.map(project => {
                        const projectTasks = editedTasks.filter(task => task.projectId === project.id);
                        return (
                            <div key={project.id} className="project-section">
                                <div className="project-header">
                                    <h3>{project.name}</h3>
                                    {editing && (
                                        <div className="project-header-actions">
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteProject(project.id)}
                                                title="Delete project"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="project-actions">
                                    <div className="hours-input">
                                        <Clock size={16} />
                                        <input
                                            type="number"
                                            placeholder="Hours spent"
                                            value={project.hoursSpent || ''}
                                            onChange={(e) => updateProjectHours(project.id, parseFloat(e.target.value) || 0)}
                                            className="form-input hours-input-field"
                                            disabled={!editing}
                                        />
                                    </div>

                                    <div className="copy-buttons">
                                        <button
                                            className="copy-button"
                                            onClick={(e) => copyProjectBlock(project, e)}
                                            title="Copy project block"
                                        >
                                            Copy Block
                                        </button>
                                        <button
                                            className="copy-button"
                                            onClick={(e) => copyProjectTasks(project, e)}
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
                                                    {task.completed && <Check size={14} strokeWidth={3} />}
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

                                    {/* Add New Entry - Only in Edit Mode */}
                                    {editing && (
                                        <div className="add-task-container">
                                            <input
                                                type="text"
                                                placeholder="Add new entry..."
                                                value={newTaskInputs[project.id] || ''}
                                                onChange={(e) => setNewTaskInputs(prev => ({ ...prev, [project.id]: e.target.value }))}
                                                className="form-input"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        addNewTask(project.id);
                                                    }
                                                }}
                                            />
                                            <button
                                                className="add-button"
                                                onClick={() => addNewTask(project.id)}
                                                disabled={!newTaskInputs[project.id]?.trim()}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    )}
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