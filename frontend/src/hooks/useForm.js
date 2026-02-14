import { useState } from 'react';
export function useForm({ initialValues, onSubmit, validate, }) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setValues((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked : value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate) {
            const validationErrors = validate(values);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
        }
        setIsSubmitting(true);
        try {
            await onSubmit(values);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const reset = () => {
        setValues(initialValues);
        setErrors({});
    };
    const setValue = (name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };
    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        reset,
        setValue,
        setValues,
    };
}
//# sourceMappingURL=useForm.js.map