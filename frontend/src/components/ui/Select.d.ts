import React from 'react';
interface SelectOption {
    value: string;
    label: string;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
export {};
//# sourceMappingURL=Select.d.ts.map