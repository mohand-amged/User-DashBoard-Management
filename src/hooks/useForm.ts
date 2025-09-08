import { useState, useCallback, useEffect } from 'react';

interface FormErrors {
  [key: string]: string;
}

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit?: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: { [K in keyof T]: boolean };
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  setValue: (name: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string) => void;
  setErrors: (errors: FormErrors) => void;
  clearError: (name: keyof T) => void;
  clearErrors: () => void;
  markTouched: (name: keyof T) => void;
  markAllTouched: () => void;
  handleChange: (name: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (name: keyof T) => () => void;
  handleSubmit: (event: React.FormEvent) => void;
  reset: (newValues?: T) => void;
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { initialValues, validate, onSubmit } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors>({});
  const [touched, setTouchedState] = useState<{ [K in keyof T]: boolean }>(
    {} as { [K in keyof T]: boolean }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is dirty (has changes)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Set single value
  const setValue = useCallback((name: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [name]: value }));
    
    // Clear error when value changes
    if (errors[name as string]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [errors]);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  // Set single error
  const setError = useCallback((name: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [name as string]: error }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: FormErrors) => {
    setErrorsState(newErrors);
  }, []);

  // Clear single error
  const clearError = useCallback((name: keyof T) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[name as string];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  // Mark field as touched
  const markTouched = useCallback((name: keyof T) => {
    setTouchedState(prev => ({ ...prev, [name]: true }));
  }, []);

  // Mark all fields as touched
  const markAllTouched = useCallback(() => {
    const allTouched = {} as { [K in keyof T]: boolean };
    Object.keys(values).forEach(key => {
      allTouched[key as keyof T] = true;
    });
    setTouchedState(allTouched);
  }, [values]);

  // Handle input change
  const handleChange = useCallback((name: keyof T) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { type, value } = event.target;
    let processedValue: any = value;

    // Handle different input types
    if (type === 'checkbox') {
      processedValue = (event.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }

    setValue(name, processedValue);
  }, [setValue]);

  // Handle input blur
  const handleBlur = useCallback((name: keyof T) => () => {
    markTouched(name);
    
    // Validate field on blur if validate function is provided
    if (validate) {
      const fieldErrors = validate(values);
      if (fieldErrors[name as string]) {
        setError(name, fieldErrors[name as string]);
      }
    }
  }, [values, validate, markTouched, setError]);

  // Handle form submission
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!onSubmit) return;

    // Mark all fields as touched
    markAllTouched();

    // Validate if validate function is provided
    if (validate) {
      const validationErrors = validate(values);
      setErrorsState(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit, markAllTouched]);

  // Reset form
  const reset = useCallback((newValues?: T) => {
    const resetValues = newValues || initialValues;
    setValuesState(resetValues);
    setErrorsState({});
    setTouchedState({} as { [K in keyof T]: boolean });
    setIsSubmitting(false);
  }, [initialValues]);

  // Run validation when values change
  useEffect(() => {
    if (validate && Object.keys(touched).length > 0) {
      const validationErrors = validate(values);
      setErrorsState(validationErrors);
    }
  }, [values, validate, touched]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    
    setValue,
    setValues,
    setError,
    setErrors,
    clearError,
    clearErrors,
    markTouched,
    markAllTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}

// Validation helper functions
export const validators = {
  required: (message = 'This field is required') => (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return '';
  },

  email: (message = 'Please enter a valid email address') => (value: string) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return '';
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (!value) return '';
    if (value.length < min) {
      return message || `Minimum ${min} characters required`;
    }
    return '';
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (!value) return '';
    if (value.length > max) {
      return message || `Maximum ${max} characters allowed`;
    }
    return '';
  },

  pattern: (regex: RegExp, message = 'Invalid format') => (value: string) => {
    if (!value) return '';
    if (!regex.test(value)) {
      return message;
    }
    return '';
  },

  phone: (message = 'Please enter a valid phone number') => (value: string) => {
    if (!value) return '';
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanValue = value.replace(/\s/g, '');
    if (!phoneRegex.test(cleanValue)) {
      return message;
    }
    return '';
  },

  url: (message = 'Please enter a valid URL') => (value: string) => {
    if (!value) return '';
    try {
      new URL(value);
      return '';
    } catch {
      return message;
    }
  },

  min: (min: number, message?: string) => (value: number) => {
    if (value === undefined || value === null) return '';
    if (value < min) {
      return message || `Value must be at least ${min}`;
    }
    return '';
  },

  max: (max: number, message?: string) => (value: number) => {
    if (value === undefined || value === null) return '';
    if (value > max) {
      return message || `Value must be at most ${max}`;
    }
    return '';
  },
};

// Compose multiple validators
export function composeValidators(...validators: Array<(value: any) => string>) {
  return (value: any) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return '';
  };
}
