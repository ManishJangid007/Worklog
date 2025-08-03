import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import TopBar from './components/TopBar';
import ActionRow from './components/ActionRow';
import TaskCard from './components/TaskCard';
import AddTaskModal from './components/AddTaskModal';
import AddProjectModal from './components/AddProjectModal';
import TaskDetailModal from './components/TaskDetailModal';
import SummaryModal from './components/SummaryModal';
import CustomDatePicker from './components/CustomDatePicker';
import { databaseService } from './services/database';
import { DailyTask } from './types';
import './App.css';

function App() {
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showAddProjectModal, setShowAddProjectModal] = useState(false);
    const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [selectedDailyTask, setSelectedDailyTask] = useState<DailyTask | null>(null);
    const [dateFilter, setDateFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string } | null>(null);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

    const initializeApp = useCallback(async () => {
        try {
            await databaseService.init();
            await loadDailyTasks();
        } catch (error) {
            console.error('Failed to initialize app:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadDailyTasks = async () => {
        try {
            const tasks = await databaseService.getAllDailyTasks();
            setDailyTasks(tasks);
        } catch (error) {
            console.error('Failed to load daily tasks:', error);
        }
    };

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    const handleAddTask = () => {
        setShowAddTaskModal(true);
    };

    const handleAddProject = () => {
        setShowAddProjectModal(true);
    };

    const handleProjectAdded = () => {
        // Refresh the app to reflect any project changes
        loadDailyTasks();
    };

    const handleSort = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleSummary = () => {
        setShowSummaryModal(true);
    };

    const handleDateFilter = (filter: string) => {
        setDateFilter(filter);
        if (filter !== 'custom') {
            setCustomDateRange(null);
            setShowCustomDatePicker(false);
        } else {
            setShowCustomDatePicker(true);
        }
    };

    const handleCustomDateRange = (start: string, end: string) => {
        setCustomDateRange({ start, end });
        setShowCustomDatePicker(false);
    };

    const handleClearFilter = () => {
        setDateFilter('all');
        setCustomDateRange(null);
        setShowCustomDatePicker(false);
    };

    const handleViewDetails = (dailyTask: DailyTask) => {
        setSelectedDailyTask(dailyTask);
        setShowTaskDetailModal(true);
    };

    const handleTaskSaved = (newDailyTask: DailyTask) => {
        setDailyTasks(prev => {
            const existingIndex = prev.findIndex(task => task.date === newDailyTask.date);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newDailyTask;
                return updated;
            } else {
                return [...prev, newDailyTask];
            }
        });
    };

    const handleTaskUpdated = () => {
        loadDailyTasks();
    };

    const getFilteredAndSortedTasks = () => {
        let filtered = [...dailyTasks];

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            switch (dateFilter) {
                case 'ytd':
                    const yearStart = new Date(now.getFullYear(), 0, 1);
                    filtered = filtered.filter(task => new Date(task.date) >= yearStart);
                    break;
                case 'mtd':
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    filtered = filtered.filter(task => new Date(task.date) >= monthStart);
                    break;
                case 'wtd':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    filtered = filtered.filter(task => new Date(task.date) >= weekStart);
                    break;
                case 'custom':
                    if (customDateRange) {
                        filtered = filtered.filter(task => {
                            const taskDate = new Date(task.date);
                            const startDate = new Date(customDateRange.start);
                            const endDate = new Date(customDateRange.end);
                            return taskDate >= startDate && taskDate <= endDate;
                        });
                    }
                    break;
            }
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });

        return filtered;
    };

    if (loading) {
        return (
            <div className="app">
                <div className="loading-screen">
                    <div className="loading-spinner"></div>
                    <p>Loading Worklog...</p>
                </div>
            </div>
        );
    }

    const filteredTasks = getFilteredAndSortedTasks();

    return (
        <ThemeProvider>
            <div className="app">
                <TopBar
                    onBackup={() => { }}
                    onRestore={() => { }}
                />

                <div className="main-content">
                    <ActionRow
                        onAddTask={handleAddTask}
                        onAddProject={handleAddProject}
                        onSort={handleSort}
                        onSummary={handleSummary}
                        onDateFilter={handleDateFilter}
                        onClearFilter={handleClearFilter}
                        currentFilter={dateFilter}
                        sortOrder={sortOrder}
                        customDateRange={customDateRange}
                    />

                    <div className="tasks-container">
                        {filteredTasks.length === 0 ? (
                            <div className="empty-state">
                                <h2>No tasks found</h2>
                                <p>Start by adding your first worklog entry to get organized!</p>
                                <button className="button primary" onClick={handleAddTask}>
                                    Add Your First Entry
                                </button>
                            </div>
                        ) : (
                            <div className="tasks-grid">
                                {filteredTasks.map(dailyTask => (
                                    <TaskCard
                                        key={dailyTask.id}
                                        dailyTask={dailyTask}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <AddTaskModal
                    isOpen={showAddTaskModal}
                    onClose={() => setShowAddTaskModal(false)}
                    onSave={handleTaskSaved}
                />

                <AddProjectModal
                    isOpen={showAddProjectModal}
                    onClose={() => setShowAddProjectModal(false)}
                    onProjectAdded={handleProjectAdded}
                />

                <TaskDetailModal
                    dailyTask={selectedDailyTask}
                    isOpen={showTaskDetailModal}
                    onClose={() => setShowTaskDetailModal(false)}
                    onUpdate={handleTaskUpdated}
                />

                <SummaryModal
                    isOpen={showSummaryModal}
                    onClose={() => setShowSummaryModal(false)}
                    dateFilter={dateFilter}
                    onDateFilterChange={handleDateFilter}
                />

                <CustomDatePicker
                    isOpen={showCustomDatePicker}
                    onClose={() => setShowCustomDatePicker(false)}
                    onDateRangeSelect={handleCustomDateRange}
                />
            </div>
        </ThemeProvider>
    );
}

export default App;
