import React from 'react';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}
export declare function Modal({ isOpen, onClose, title, children, size }: ModalProps): React.ReactPortal | null;
export {};
//# sourceMappingURL=Modal.d.ts.map