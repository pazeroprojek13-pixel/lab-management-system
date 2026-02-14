import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
export const Input = forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [label, props.required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] })), _jsx("input", { ref: ref, className: `
            w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2
            ${error
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
            ${className}
          `, ...props }), error && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: error })), helperText && !error && (_jsx("p", { className: "mt-1 text-sm text-gray-500", children: helperText }))] }));
});
Input.displayName = 'Input';
//# sourceMappingURL=Input.js.map