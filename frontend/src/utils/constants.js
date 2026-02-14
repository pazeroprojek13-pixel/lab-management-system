export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const ROLE_LABELS = {
    ADMIN: 'Administrator',
    LAB_ASSISTANT: 'Lab Assistant',
    LECTURER: 'Lecturer',
    STUDENT: 'Student',
};
export const STATUS_COLORS = {
    // Equipment Status
    AVAILABLE: { bg: 'bg-green-100', text: 'text-green-800' },
    IN_USE: { bg: 'bg-blue-100', text: 'text-blue-800' },
    BROKEN: { bg: 'bg-red-100', text: 'text-red-800' },
    UNDER_MAINTENANCE: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    // Lab Status
    ACTIVE: { bg: 'bg-green-100', text: 'text-green-800' },
    MAINTENANCE: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800' },
    // Incident Status
    OPEN: { bg: 'bg-red-100', text: 'text-red-800' },
    IN_PROGRESS: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    RESOLVED: { bg: 'bg-green-100', text: 'text-green-800' },
    CLOSED: { bg: 'bg-gray-100', text: 'text-gray-800' },
    // Maintenance Status
    SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800' },
    IN_PROGRESS: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800' },
};
//# sourceMappingURL=constants.js.map