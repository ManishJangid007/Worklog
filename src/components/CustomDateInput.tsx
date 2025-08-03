import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';

interface CustomDateInputProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    min?: string;
    max?: string;
    className?: string;
}

const CustomDateInput: React.FC<CustomDateInputProps> = ({
    value,
    onChange,
    placeholder = 'Select date',
    min,
    max,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset selected date when value changes externally (e.g., when modal closes)
    useEffect(() => {
        if (!value) {
            setSelectedDate(null);
        } else {
            setSelectedDate(new Date(value));
        }
    }, [value]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const selectDate = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
        // Format date as YYYY-MM-DD for consistent date handling
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(newDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${dayStr}`;
        onChange(formattedDate);
        setIsOpen(false);
    };

    const clearDate = () => {
        setSelectedDate(null);
        onChange('');
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentDate.getMonth() &&
                selectedDate.getFullYear() === currentDate.getFullYear();
            const isToday = date.toDateString() === new Date().toDateString();

            // Check if date is before min date (for end date validation)
            const isDisabled = Boolean(min && date < new Date(min));

            days.push(
                <button
                    key={day}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && selectDate(day)}
                    disabled={isDisabled}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className={`custom-date-input ${className}`} ref={dropdownRef}>
            <div
                className="date-input-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar size={16} />
                <span className="date-input-value">
                    {selectedDate ? formatDate(selectedDate) : placeholder}
                </span>
                {selectedDate && (
                    <button
                        className="clear-date-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            clearDate();
                        }}
                    >
                        <X size={14} />
                    </button>
                )}
                <ChevronDown size={16} className={`chevron ${isOpen ? 'rotated' : ''}`} />
            </div>

            {isOpen && (
                <div className="date-input-dropdown">
                    <div className="date-input-header">
                        <button
                            className="nav-button"
                            onClick={() => navigateMonth('prev')}
                        >
                            ‹
                        </button>
                        <span className="current-month">
                            {currentDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long'
                            })}
                        </span>
                        <button
                            className="nav-button"
                            onClick={() => navigateMonth('next')}
                        >
                            ›
                        </button>
                    </div>

                    <div className="date-input-calendar">
                        <div className="calendar-header">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="calendar-day-header">{day}</div>
                            ))}
                        </div>
                        <div className="calendar-grid">
                            {renderCalendar()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDateInput; 