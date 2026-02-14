import { ChangeEvent, FormEvent } from 'react';
interface UseFormOptions<T> {
    initialValues: T;
    onSubmit: (values: T) => Promise<void> | void;
    validate?: (values: T) => Partial<Record<keyof T, string>>;
}
export declare function useForm<T extends Record<string, unknown>>({ initialValues, onSubmit, validate, }: UseFormOptions<T>): {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    isSubmitting: boolean;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
    reset: () => void;
    setValue: (name: keyof T, value: unknown) => void;
    setValues: import("react").Dispatch<import("react").SetStateAction<T>>;
};
export {};
//# sourceMappingURL=useForm.d.ts.map