import React from 'react';
import worklogBlackIcon from '../assets/worklog_black_icon.png';
import worklogWhiteIcon from '../assets/worklog_white_icon.png';

interface AppIconProps {
    size?: number;
    className?: string;
    variant?: 'black' | 'white';
}

const AppIcon: React.FC<AppIconProps> = ({
    size = 32,
    className = '',
    variant = 'black'
}) => {
    const iconSrc = variant === 'white' ? worklogWhiteIcon : worklogBlackIcon;
    // Use the larger size for container to accommodate white variant
    const containerSize = size * 1.4;
    // Adjust size for white variant to make it larger
    const adjustedSize = variant === 'white' ? size * 1.4 : size;

    return (
        <div
            style={{
                width: containerSize,
                height: containerSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            className={className}
        >
            <img
                src={iconSrc}
                alt="Worklog"
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center'
                }}
            />
        </div>
    );
};

export default AppIcon; 