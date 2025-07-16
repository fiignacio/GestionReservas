import React, { forwardRef } from 'react';

const Input = forwardRef(({ type = 'text', className = '', ...props }, ref) => (
    <input
        ref={ref}
        type={type}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
        {...props}
    />
));

export default Input;