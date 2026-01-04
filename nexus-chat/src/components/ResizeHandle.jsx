import React from 'react';

const ResizeHandle = ({ onMouseDown, style }) => {
    return (
        <div
            className="resize-handle"
            onMouseDown={onMouseDown}
            style={{
                width: '4px',
                cursor: 'col-resize',
                height: '100%',
                position: 'absolute',
                zIndex: 10,
                opacity: 0,
                transition: 'opacity 0.2s',
                ...style
            }}
            onMouseEnter={(e) => e.target.style.opacity = 1}
            onMouseLeave={(e) => e.target.style.opacity = 0}
        >
            <div style={{
                width: '2px',
                height: '100%',
                background: 'rgba(255,255,255,0.2)',
                margin: '0 auto'
            }} />
        </div>
    );
};

export default ResizeHandle;
