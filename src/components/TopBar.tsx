import React from 'react';
import { Download, Upload, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { databaseService } from '../services/database';
import AppIcon from './AppIcon';

interface TopBarProps {
    onBackup: () => void;
    onRestore: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onBackup, onRestore }) => {
    const { theme, toggleTheme } = useTheme();

    const handleExport = async () => {
        try {
            const data = await databaseService.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `worklog-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    await databaseService.importData(data);
                    alert('Data imported successfully!');
                    window.location.reload();
                } catch (error) {
                    console.error('Import failed:', error);
                    alert('Failed to import data');
                }
            }
        };
        input.click();
    };

    return (
        <div className="top-bar">
            <div className="top-bar-content">
                <div className="app-title-container">
                    <AppIcon size={64} variant={theme.mode === 'light' ? 'black' : 'white'} />
                    <h1 className="app-title">Worklog</h1>
                </div>
                <div className="top-bar-actions">
                    <button
                        className="icon-button"
                        onClick={handleExport}
                        title="Export Data"
                    >
                        <Download size={20} />
                    </button>
                    <button
                        className="icon-button"
                        onClick={handleImport}
                        title="Import Data"
                    >
                        <Upload size={20} />
                    </button>
                    <button
                        className="icon-button"
                        onClick={toggleTheme}
                        title={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme.mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopBar; 