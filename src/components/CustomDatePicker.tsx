import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import CustomDateInput from './CustomDateInput';

interface CustomDatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onDateRangeSelect: (start: string, end: string) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    isOpen,
    onClose,
    onDateRangeSelect
}) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate) {
            // Validate that end date is not before start date
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (end < start) {
                alert('End date cannot be before start date');
                return;
            }

            onDateRangeSelect(startDate, endDate);
        }
    };

    const handleCancel = () => {
        setStartDate('');
        setEndDate('');
        onClose();
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStartDate('');
            setEndDate('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-header-left">
                        <h2>Select Date Range</h2>
                    </div>
                    <button className="close-button" onClick={handleCancel}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={16} />
                                Start Date
                            </label>
                            <CustomDateInput
                                value={startDate}
                                onChange={setStartDate}
                                placeholder="Select start date"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={16} />
                                End Date
                            </label>
                            <CustomDateInput
                                value={endDate}
                                onChange={setEndDate}
                                placeholder="Select end date"
                                min={startDate}
                                className="form-input"
                            />
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="button secondary" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="button primary" disabled={!startDate || !endDate}>
                                Apply Filter
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomDatePicker; 