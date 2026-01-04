import React from 'react';
import yapLogo from '../assets/yap-logo.jpg';

const YapLogo = ({ size = 42, theme = 'theme-midnight', isDarkMode = true }) => {
    // Theme-based filter adjustments
    const getLogoStyle = () => {
        const baseStyle = {
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '12px',
            objectFit: 'cover',
            transition: 'all 0.3s ease',
        };

        // Apply theme-specific filters
        const themeFilters = {
            'theme-midnight': isDarkMode ? 'brightness(1) saturate(1.2)' : 'brightness(0.9) saturate(0.9)',
            'theme-crystal': isDarkMode ? 'brightness(1.1) saturate(1.3) hue-rotate(-10deg)' : 'brightness(0.95) saturate(0.85)',
            'theme-sky': 'brightness(1) saturate(1.4) hue-rotate(15deg)',
            'theme-mint': 'brightness(1.05) saturate(1.2) hue-rotate(120deg)',
            'theme-rose': 'brightness(0.95) saturate(1.3) hue-rotate(-30deg)',
            'theme-slate': 'brightness(0.9) saturate(0.7)',
        };

        return {
            ...baseStyle,
            filter: themeFilters[theme] || themeFilters['theme-midnight'],
            opacity: isDarkMode ? 1 : 0.95,
        };
    };

    return (
        <img
            src={yapLogo}
            alt="Yap Chat Logo"
            style={getLogoStyle()}
        />
    );
};

export default YapLogo;
