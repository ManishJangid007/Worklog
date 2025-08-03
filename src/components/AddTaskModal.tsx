import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Project, DailyTask } from '../types';
import { databaseService } from '../services/database';
import { v4 as uuidv4 } from 'uuid';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dailyTask: DailyTask) => void;
}

interface ProjectSection {
    id: string;
    projectId: string;
    projectName: string;
    tasks: { id: string; description: string }[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSave }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectSections, setProjectSections] = useState<ProjectSection[]>([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [showNewProjectInput, setShowNewProjectInput] = useState(false);

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
            setNewProjectName('');
            setShowNewProjectInput(false);
        } catch (error) {
            console.error('Failed to add project:', error);
        }
    };

    const addProjectSection = (projectId: string, projectName: string) => {
        // Check if project section already exists
        if (projectSections.some(section => section.projectId === projectId)) {
            return;
        }

        const newSection: ProjectSection = {
            id: uuidv4(),
            projectId,
            projectName,
            tasks: []
        };

        setProjectSections([...projectSections, newSection]);
    };

    const removeProjectSection = (sectionId: string) => {
        setProjectSections(projectSections.filter(section => section.id !== sectionId));
    };

    const addTaskToSection = (sectionId: string, taskDescription: string) => {
        if (!taskDescription.trim()) return;

        const updatedSections = projectSections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    tasks: [...section.tasks, {
                        id: uuidv4(),
                        description: taskDescription.trim()
                    }]
                };
            }
            return section;
        });

        setProjectSections(updatedSections);
    };

    const removeTaskFromSection = (sectionId: string, taskId: string) => {
        const updatedSections = projectSections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    tasks: section.tasks.filter(task => task.id !== taskId)
                };
            }
            return section;
        });

        setProjectSections(updatedSections);
    };

    const handleSave = async () => {
        const allTasks = projectSections.flatMap(section =>
            section.tasks.map(task => ({
                ...task,
                projectId: section.projectId,
                date: selectedDate.toISOString().split('T')[0]
            }))
        );

        if (allTasks.length === 0) return;

        const dailyTask: DailyTask = {
            id: uuidv4(),
            date: selectedDate.toISOString().split('T')[0],
            projects: projects.filter(p => projectSections.some(s => s.projectId === p.id)),
            tasks: allTasks
        };

        try {
            // Save daily task
            await databaseService.saveDailyTask(dailyTask);

            // Save individual tasks
            for (const task of allTasks) {
                await databaseService.saveTask({
                    ...task,
                    date: selectedDate.toISOString().split('T')[0]
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
        setSelectedDate(new Date());
        setProjectSections([]);
        setNewProjectName('');
        setShowNewProjectInput(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal add-task-modal">
                <div className="modal-header">
                    <h2>Add Tasks</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    {/* Beautiful Date Picker */}
                    <div className="form-group">
                        <label className="form-label">
                            <Calendar size={16} className="label-icon" />
                            Date
                        </label>
                        <div className="date-picker-container">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        setSelectedDate(date);
                                    }
                                }}
                                dateFormat="MMMM d, yyyy"
                                className="date-picker-input"
                                placeholderText="Select date"
                                showPopperArrow={false}
                                popperPlacement="bottom-start"
                            />
                        </div>
                    </div>

                    {/* Project Selection */}
                    <div className="form-group">
                        <label className="form-label">Add Projects</label>
                        <div className="project-selector">
                            <select
                                className="form-select"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const project = projects.find(p => p.id === e.target.value);
                                        if (project) {
                                            addProjectSection(project.id, project.name);
                                        }
                                        e.target.value = '';
                                    }
                                }}
                                value=""
                            >
                                <option value="">Select a project to add</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>

                            {!showNewProjectInput ? (
                                <button
                                    className="add-new-project-btn"
                                    onClick={() => setShowNewProjectInput(true)}
                                >
                                    <Plus size={16} />
                                    New Project
                                </button>
                            ) : (
                                <div className="new-project-input">
                                    <input
                                        type="text"
                                        placeholder="Enter project name"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="form-input"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddProject();
                                            }
                                        }}
                                    />
                                    <button
                                        className="add-button"
                                        onClick={handleAddProject}
                                        disabled={!newProjectName.trim()}
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        className="cancel-button"
                                        onClick={() => {
                                            setShowNewProjectInput(false);
                                            setNewProjectName('');
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Sections */}
                    {projectSections.length > 0 && (
                        <div className="project-sections">
                            <h3>Project Sections</h3>
                            {projectSections.map(section => (
                                <div key={section.id} className="project-section">
                                    <div className="section-header">
                                        <h4>{section.projectName}</h4>
                                        <button
                                            className="remove-section-btn"
                                            onClick={() => removeProjectSection(section.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <TaskInput
                                        onAddTask={(taskDescription) => addTaskToSection(section.id, taskDescription)}
                                    />

                                    {section.tasks.length > 0 && (
                                        <div className="tasks-list">
                                            {section.tasks.map(task => (
                                                <div key={task.id} className="task-item">
                                                    <span className="task-description">{task.description}</span>
                                                    <button
                                                        className="remove-task-btn"
                                                        onClick={() => removeTaskFromSection(section.id, task.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
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
                        disabled={projectSections.every(section => section.tasks.length === 0)}
                    >
                        Save Tasks
                    </button>
                </div>
            </div>
        </div>
    );
};

// Separate component for task input
interface TaskInputProps {
    onAddTask: (taskDescription: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
    const [taskDescription, setTaskDescription] = useState('');

    const handleAddTask = () => {
        if (!taskDescription.trim()) return;
        onAddTask(taskDescription);
        setTaskDescription('');
    };

    return (
        <div className="task-input">
            <input
                type="text"
                placeholder="Enter task description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="form-input"
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleAddTask();
                    }
                }}
            />
            <button
                className="add-button"
                onClick={handleAddTask}
                disabled={!taskDescription.trim()}
            >
                <Plus size={16} />
            </button>
        </div>
    );
};

export default AddTaskModal; 