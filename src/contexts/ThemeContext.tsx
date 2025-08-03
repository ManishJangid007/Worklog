import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                const parsed = JSON.parse(savedTheme);
                // Validate that the parsed data has the correct structure
                if (parsed && typeof parsed.mode === 'string' && (parsed.mode === 'light' || parsed.mode === 'dark')) {
                    return parsed;
                }
            }
        } catch (error) {
            console.warn('Failed to parse theme from localStorage:', error);
            // Clear invalid data
            localStorage.removeItem('theme');
        }
        return { mode: 'light' };
    });

    useEffect(() => {
        localStorage.setItem('theme', JSON.stringify(theme));
        document.documentElement.setAttribute('data-theme', theme.mode);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => ({
            mode: prev.mode === 'light' ? 'dark' : 'light'
        }));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}; 