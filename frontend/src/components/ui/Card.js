import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Card({ children, className = '', title, subtitle, headerAction }) {
    return (_jsxs("div", { className: `bg-white rounded-xl shadow-sm border border-gray-200 ${className}`, children: [(title || headerAction) && (_jsxs("div", { className: "px-6 py-4 border-b border-gray-200 flex items-center justify-between", children: [_jsxs("div", { children: [title && _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: title }), subtitle && _jsx("p", { className: "text-sm text-gray-500 mt-1", children: subtitle })] }), headerAction && _jsx("div", { children: headerAction })] })), _jsx("div", { className: "p-6", children: children })] }));
}
//# sourceMappingURL=Card.js.map