import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

interface BadgeProps {
  status: string;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ status, children, className = '' }: BadgeProps) {
  const colors = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}
    >
      {children}
    </span>
  );
}
