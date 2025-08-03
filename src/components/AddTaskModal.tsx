import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, DailyTask } from '../types';
import { databaseService } from '../services/database';
import { v4 as uuidv4 } from 'uuid';
import AlertModal from './AlertModal';

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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [resetKey, setResetKey] = useState(0);
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'error' | 'warning' | 'info' | 'success';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'error'
    });

    useEffect(() => {
        if (isOpen) {
            loadProjects();
        } else {
            // Reset form when modal closes
            resetForm();
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

        const selectedDateStr = selectedDate.toISOString().split('T')[0];

        // Check if a daily task already exists for this date
        const existingDailyTask = await databaseService.getDailyTask(selectedDateStr);

        if (existingDailyTask) {
            setAlertModal({
                isOpen: true,
                title: 'Task Card Already Exists',
                message: `Tasks already exist for ${formatDate(selectedDate)}. Please modify the existing task card instead.`,
                type: 'warning'
            });
            return;
        }

        // Check for existing tasks on the same date
        const existingTasks = await databaseService.getTasksByDate(selectedDateStr);

        if (existingTasks.length > 0) {
            const existingTaskNames = existingTasks.map(task => task.description.toLowerCase());
            const newTaskNames = allTasks.map(task => task.description.toLowerCase());

            const duplicates = newTaskNames.filter(name => existingTaskNames.includes(name));

            if (duplicates.length > 0) {
                setAlertModal({
                    isOpen: true,
                    title: 'Duplicate Tasks Found',
                    message: `Tasks already exist for this date: ${duplicates.join(', ')}. Please modify existing tasks instead.`,
                    type: 'error'
                });
                return;
            }
        }

        const dailyTask: DailyTask = {
            id: uuidv4(),
            date: selectedDateStr,
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
                    date: selectedDateStr
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
        setShowDatePicker(false);
        setCurrentMonth(new Date());
        setResetKey(prev => prev + 1);
    };

    // Custom Date Picker Functions
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const isToday = (date: Date) => {
        return isSameDay(date, new Date());
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setShowDatePicker(false);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            if (direction === 'prev') {
                newMonth.setMonth(newMonth.getMonth() - 1);
            } else {
                newMonth.setMonth(newMonth.getMonth() + 1);
            }
            return newMonth;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal add-task-modal">
                <div className="modal-header">
                    <h2>Add Tasks</h2>
                    <button className="close-button" onClick={() => {
                        resetForm();
                        onClose();
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    {/* Custom Date Picker */}
                    <div className="form-group">
                        <label className="form-label">
                            <Calendar size={16} className="label-icon" />
                            Date
                        </label>
                        <div className="custom-date-picker">
                            <button
                                className="date-picker-trigger"
                                onClick={() => setShowDatePicker(!showDatePicker)}
                            >
                                <Calendar size={16} />
                                <span>{formatDate(selectedDate)}</span>
                                <ChevronRight size={16} className={`chevron ${showDatePicker ? 'rotated' : ''}`} />
                            </button>

                            {showDatePicker && (
                                <div className="date-picker-dropdown">
                                    <div className="date-picker-header">
                                        <button
                                            className="nav-button"
                                            onClick={() => navigateMonth('prev')}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="current-month">
                                            {currentMonth.toLocaleDateString('en-US', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <button
                                            className="nav-button"
                                            onClick={() => navigateMonth('next')}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    <div className="date-picker-calendar">
                                        <div className="calendar-header">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                <div key={day} className="calendar-day-header">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="calendar-grid">
                                            {getDaysInMonth(currentMonth).map((day, index) => (
                                                <div
                                                    key={index}
                                                    className={`calendar-day ${!day ? 'empty' : ''} ${day && isSameDay(day, selectedDate) ? 'selected' : ''} ${day && isToday(day) ? 'today' : ''}`}
                                                    onClick={() => day && handleDateSelect(day)}
                                                >
                                                    {day ? day.getDate() : ''}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                        key={`${section.id}-${resetKey}`}
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
                    <button className="button secondary" onClick={() => {
                        resetForm();
                        onClose();
                    }}>
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

            {/* Beautiful Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
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