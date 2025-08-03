import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { DailyTask } from '../types';
import { databaseService } from '../services/database';
import CustomDatePicker from './CustomDatePicker';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    dateFilter: string;
    onDateFilterChange?: (filter: string) => void;
    customDateRange?: { start: string; end: string } | null;
    onCustomDateRangeChange?: (start: string, end: string) => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({
    isOpen,
    onClose,
    dateFilter,
    onDateFilterChange,
    customDateRange,
    onCustomDateRangeChange
}) => {
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [summaryDateFilter, setSummaryDateFilter] = useState('all');
    const [summaryCustomDateRange, setSummaryCustomDateRange] = useState<{ start: string; end: string } | null>(null);
    const [showSummaryCustomDatePicker, setShowSummaryCustomDatePicker] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const allDailyTasks = await databaseService.getAllDailyTasks();

            // Filter tasks based on date filter
            const filterTasksByDate = (tasks: DailyTask[]): DailyTask[] => {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                switch (summaryDateFilter) {
                    case 'ytd':
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        return tasks.filter(task => new Date(task.date) >= yearStart);
                    case 'mtd':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return tasks.filter(task => new Date(task.date) >= monthStart);
                    case 'wtd':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        return tasks.filter(task => new Date(task.date) >= weekStart);
                    case 'custom':
                        if (summaryCustomDateRange) {
                            return tasks.filter(task => {
                                const taskDate = new Date(task.date);
                                const startDate = new Date(summaryCustomDateRange.start);
                                const endDate = new Date(summaryCustomDateRange.end);
                                return taskDate >= startDate && taskDate <= endDate;
                            });
                        }
                        return tasks;
                    default:
                        return tasks;
                }
            };

            const filteredTasks = filterTasksByDate(allDailyTasks);
            setDailyTasks(filteredTasks);
        } catch (error) {
            console.error('Failed to load summary data:', error);
        } finally {
            setLoading(false);
        }
    }, [summaryDateFilter, summaryCustomDateRange]);

    useEffect(() => {
        if (isOpen) {
            loadData();
        } else {
            // Reset filters when modal closes
            setSummaryDateFilter('all');
            setSummaryCustomDateRange(null);
            setShowSummaryCustomDatePicker(false);
        }
    }, [isOpen, loadData]);

    const getProjectHours = () => {
        const projectHours: { [key: string]: number } = {};

        dailyTasks.forEach(dailyTask => {
            dailyTask.projects.forEach(project => {
                if (project.hoursSpent) {
                    projectHours[project.name] = (projectHours[project.name] || 0) + project.hoursSpent;
                }
            });
        });

        return projectHours;
    };

    const getChartData = () => {
        const projectHours = getProjectHours();
        const labels = Object.keys(projectHours);
        const data = Object.values(projectHours);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#FF6384',
                        '#C9CBCF'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }
            ]
        };
    };

    const getTotalHours = () => {
        const projectHours = getProjectHours();
        return Object.values(projectHours).reduce((sum, hours) => sum + hours, 0);
    };



    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal large">
                <div className="modal-header">
                    <div className="modal-header-left">
                        <h2>Summary</h2>
                    </div>
                    <div className="modal-header-right">
                        <div className="summary-date-filter">
                            <select
                                value={summaryDateFilter}
                                onChange={(e) => {
                                    const filter = e.target.value;
                                    setSummaryDateFilter(filter);
                                    if (filter === 'custom') {
                                        setShowSummaryCustomDatePicker(true);
                                    }
                                }}
                                className="filter-select"
                            >
                                <option value="all">All Time</option>
                                <option value="ytd">Year to Date</option>
                                <option value="mtd">Month to Date</option>
                                <option value="wtd">Week to Date</option>
                                <option value="custom">
                                    {summaryCustomDateRange
                                        ? `Custom: ${new Date(summaryCustomDateRange.start).toLocaleDateString()} - ${new Date(summaryCustomDateRange.end).toLocaleDateString()}`
                                        : 'Custom Range'
                                    }
                                </option>
                            </select>
                            {(summaryDateFilter !== 'all' || summaryCustomDateRange) && (
                                <button
                                    className="clear-filter-btn"
                                    onClick={() => {
                                        setSummaryDateFilter('all');
                                        setSummaryCustomDateRange(null);
                                    }}
                                    title="Clear filter"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button className="close-button" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="modal-content">
                    {loading ? (
                        <div className="loading">Loading summary data...</div>
                    ) : (
                        <>
                            <div className="summary-stats">
                                <div className="stat-card">
                                    <h3>Total Hours</h3>
                                    <span className="stat-value">{getTotalHours().toFixed(1)}</span>
                                </div>
                                <div className="stat-card">
                                    <h3>Days Tracked</h3>
                                    <span className="stat-value">{dailyTasks.length}</span>
                                </div>
                                <div className="stat-card">
                                    <h3>Projects</h3>
                                    <span className="stat-value">{Object.keys(getProjectHours()).length}</span>
                                </div>
                            </div>

                            {Object.keys(getProjectHours()).length > 0 ? (
                                <div className="chart-container">
                                    <h3>Hours by Project</h3>
                                    <div className="chart-wrapper">
                                        <Doughnut
                                            data={getChartData()}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom' as const,
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => {
                                                                const total = getTotalHours();
                                                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                                                return `${context.label}: ${context.parsed}h (${percentage}%)`;
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No hours data available for the selected period.</p>
                                    <p>Add hours spent to your projects to see the summary.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <CustomDatePicker
                isOpen={showSummaryCustomDatePicker}
                onClose={() => setShowSummaryCustomDatePicker(false)}
                onDateRangeSelect={(start, end) => {
                    setSummaryCustomDateRange({ start, end });
                    setShowSummaryCustomDatePicker(false);
                }}
            />
        </div>
    );
};

export default SummaryModal; 