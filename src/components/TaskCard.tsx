import React from 'react';
import { Eye, Calendar } from 'lucide-react';
import { DailyTask } from '../types';

interface TaskCardProps {
    dailyTask: DailyTask;
    onViewDetails: (dailyTask: DailyTask) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ dailyTask, onViewDetails }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getProjectCount = () => {
        return dailyTask.projects.length;
    };

    const getTaskCount = () => {
        return dailyTask.tasks.length;
    };

    return (
        <div className="task-card">
            <div className="task-card-header">
                <div className="task-card-date">
                    <Calendar size={16} />
                    <span>{formatDate(dailyTask.date)}</span>
                </div>
                <button
                    className="view-details-button"
                    onClick={() => onViewDetails(dailyTask)}
                >
                    <Eye size={16} />
                    View Details
                </button>
            </div>

            <div className="task-card-content">
                <div className="task-card-stats">
                    <span className="stat">
                        {getProjectCount()} Project{getProjectCount() !== 1 ? 's' : ''}
                    </span>
                    <span className="stat">
                        {getTaskCount()} Task{getTaskCount() !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="task-card-projects">
                    {dailyTask.projects.slice(0, 3).map((project) => (
                        <span key={project.id} className="project-tag">
                            {project.name}
                        </span>
                    ))}
                    {dailyTask.projects.length > 3 && (
                        <span className="project-tag more">
                            +{dailyTask.projects.length - 3} more
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard; 