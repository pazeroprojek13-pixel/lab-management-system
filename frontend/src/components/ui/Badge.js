import { jsx as _jsx } from "react/jsx-runtime";
import { STATUS_COLORS } from '../../utils/constants';
export function Badge({ status, children, className = '' }) {
    const colors = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`, children: children }));
}
//# sourceMappingURL=Badge.js.map