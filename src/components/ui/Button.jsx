import React from 'react';

const Button = ({ children, onClick, className = '', disabled = false, ...props }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-md font-semibold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${className}`}
        {...props}
    >
        {children}
    </button>
);

export default Button;