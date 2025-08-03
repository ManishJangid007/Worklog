import React from 'react';
import { Plus, Filter, BarChart3, Calendar } from 'lucide-react';

interface ActionRowProps {
    onAddTask: () => void;
    onAddProject: () => void;
    onSort: () => void;
    onSummary: () => void;
    onDateFilter: (filter: 'all' | 'ytd' | 'mtd' | 'wtd' | 'custom') => void;
    currentFilter: string;
}

const ActionRow: React.FC<ActionRowProps> = ({
    onAddTask,
    onAddProject,
    onSort,
    onSummary,
    onDateFilter,
    currentFilter
}) => {
    const handleFilterChange = (filter: 'all' | 'ytd' | 'mtd' | 'wtd' | 'custom') => {
        onDateFilter(filter);
    };

    return (
        <div className="action-row">
            <div className="action-buttons">
                <button className="action-button primary" onClick={onAddTask}>
                    <Plus size={16} />
                    Add Task
                </button>
                <button className="action-button secondary" onClick={onAddProject}>
                    <Plus size={16} />
                    Project / Section
                </button>
                <button className="action-button secondary" onClick={onSort}>
                    <Filter size={16} />
                    Sort
                </button>
                <button className="action-button secondary" onClick={onSummary}>
                    <BarChart3 size={16} />
                    Summary
                </button>
            </div>

            <div className="date-filter">
                <Calendar size={16} />
                <select
                    value={currentFilter}
                    onChange={(e) => handleFilterChange(e.target.value as any)}
                    className="filter-select"
                >
                    <option value="all">All Time</option>
                    <option value="ytd">Year to Date</option>
                    <option value="mtd">Month to Date</option>
                    <option value="wtd">Week to Date</option>
                    <option value="custom">Custom Range</option>
                </select>
            </div>
        </div>
    );
};

export default ActionRow; 