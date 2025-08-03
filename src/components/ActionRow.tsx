import React from 'react';
import { Plus, Filter, BarChart3, Calendar, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';

interface ActionRowProps {
    onAddTask: () => void;
    onAddProject: () => void;
    onSort: () => void;
    onSummary: () => void;
    onDateFilter: (filter: 'all' | 'ytd' | 'mtd' | 'wtd' | 'custom') => void;
    onClearFilter: () => void;
    currentFilter: string;
    sortOrder: 'asc' | 'desc';
    customDateRange?: { start: string; end: string } | null;
}

const ActionRow: React.FC<ActionRowProps> = ({
    onAddTask,
    onAddProject,
    onSort,
    onSummary,
    onDateFilter,
    onClearFilter,
    currentFilter,
    sortOrder,
    customDateRange
}) => {
    const handleFilterChange = (filter: 'all' | 'ytd' | 'mtd' | 'wtd' | 'custom') => {
        onDateFilter(filter);
    };

    return (
        <div className="action-row">
            <div className="action-buttons">
                <button className="action-button primary" onClick={onAddTask}>
                    <Plus size={16} />
                    Add Entry
                </button>
                <button className="action-button secondary" onClick={onAddProject}>
                    <Plus size={16} />
                    Project / Section
                </button>
                <button className="action-button secondary" onClick={onSort}>
                    {sortOrder === 'asc' ? (
                        <ArrowUp size={16} />
                    ) : sortOrder === 'desc' ? (
                        <ArrowDown size={16} />
                    ) : (
                        <ArrowUpDown size={16} />
                    )}
                    Sort {sortOrder === 'asc' ? '(Oldest First)' : '(Newest First)'}
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
                    <option value="custom">
                        {customDateRange
                            ? `Custom: ${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(customDateRange.end).toLocaleDateString()}`
                            : 'Custom Range'
                        }
                    </option>
                </select>
                {(currentFilter !== 'all' || customDateRange) && (
                    <button
                        className="clear-filter-btn"
                        onClick={onClearFilter}
                        title="Clear filter"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ActionRow; 