import React from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'error' | 'warning' | 'info' | 'success';
}

const AlertModal: React.FC<AlertModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = 'error' 
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <AlertTriangle size={24} className="text-red-500" />;
            case 'warning':
                return <AlertTriangle size={24} className="text-yellow-500" />;
            case 'info':
                return <Info size={24} className="text-blue-500" />;
            case 'success':
                return <CheckCircle size={24} className="text-green-500" />;
            default:
                return <AlertTriangle size={24} className="text-red-500" />;
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'error':
                return 'button primary bg-red-500 hover:bg-red-600';
            case 'warning':
                return 'button primary bg-yellow-500 hover:bg-yellow-600';
            case 'info':
                return 'button primary bg-blue-500 hover:bg-blue-600';
            case 'success':
                return 'button primary bg-green-500 hover:bg-green-600';
            default:
                return 'button primary';
        }
    };

    return (
        <div className="modal-overlay alert-overlay">
            <div className="alert-modal">
                <div className="alert-header">
                    <div className="alert-icon">
                        {getIcon()}
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="alert-content">
                    <h3 className="alert-title">{title}</h3>
                    <p className="alert-message">{message}</p>
                </div>
                
                <div className="alert-footer">
                    <button 
                        className={getButtonClass()}
                        onClick={onClose}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal; 