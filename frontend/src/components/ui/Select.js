import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
export const Select = forwardRef(({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [label, props.required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] })), _jsxs("select", { ref: ref, className: `
            w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 bg-white
            ${error
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
            ${className}
          `, ...props, children: [placeholder && (_jsx("option", { value: "", disabled: true, children: placeholder })), options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), error && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: error }))] }));
});
Select.displayName = 'Select';
//# sourceMappingURL=Select.js.map