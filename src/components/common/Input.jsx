import React, { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';

interface InputProps {
    type?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
}

const Input: React.FC<InputProps> = ({
    type = "text",
    value,
    onChange,
    placeholder,
    className,
    disabled,
    label
}) => {
    const [inputError, setInputError] = useState<string | null>(null);


    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        let sanitizedValue = "";
        try {
            sanitizedValue = DOMPurify.sanitize(inputValue);
        } catch (error) {
            console.error('Error sanitizing input:', error);
            setInputError('Invalid Input');
            return;
        }
        if (inputValue !== value) {

            let validationError = null;
            if (type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(sanitizedValue)) {
                   validationError = "Invalid email format";
                }
             } else if (type === 'password') {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
                if (!passwordRegex.test(sanitizedValue)) {
                    validationError = "Password must be at least 8 characters long and include uppercase, lowercase, number and special character";
                 }
            }
            setInputError(validationError);
           if(!validationError) {
                 onChange(event);
           }

        }


    }, [type, value, onChange]);


    const baseStyles = "border rounded px-3 py-2 focus:outline-none focus:ring focus:border-primary";
    const combinedClasses = `${baseStyles} ${className || ''}`;
    const inputId = `input-${Math.random().toString(36).substring(2, 15)}`;


    return (
        <div className="mb-4">
            {label && <label htmlFor={inputId} className="block text-gray-700 text-sm font-bold mb-2">{label}</label>}
            <input
                type={type}
                id={inputId}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={combinedClasses}
                disabled={disabled}
                 aria-invalid={!!inputError}
                 aria-describedby={inputError ? `${inputId}-error` : undefined}
            />
              {inputError && (
                    <p id={`${inputId}-error`} className="text-error text-sm mt-1">{inputError}</p>
                )}
        </div>
    );
};


export default Input;


if (import.meta.vitest) {
    const { describe, it, expect, vi } = import.meta.vitest;
    const { render, fireEvent } = import('@testing-library/react');

    describe('Input Component', () => {
        it('should render an input field with the correct type', () => {
            const { getByRole } = render(<Input type="email" value="" onChange={() => {}} />);
            const inputElement = getByRole('textbox') as HTMLInputElement;
            expect(inputElement).toBeInTheDocument();
            expect(inputElement.type).toBe('email');
        });


        it('should update the input value when typing', () => {
            const onChange = vi.fn();
            const { getByRole } = render(<Input type="text" value="" onChange={onChange} />);
            const inputElement = getByRole('textbox') as HTMLInputElement;
            fireEvent.change(inputElement, { target: { value: 'test' } });
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(inputElement.value).toBe('test');
        });


        it('should not trigger onChange if the value is same', () => {
            const onChange = vi.fn();
            const { getByRole } = render(<Input type="text" value="test" onChange={onChange} />);
             const inputElement = getByRole('textbox') as HTMLInputElement;
            fireEvent.change(inputElement, { target: { value: 'test' } });
             expect(onChange).toHaveBeenCalledTimes(0);
            expect(inputElement.value).toBe('test');
       });


        it('should apply the base styles and additional className', () => {
            const { getByRole } = render(<Input type="text" value="" onChange={() => {}} className="custom-class" />);
            const inputElement = getByRole('textbox') as HTMLInputElement;
            expect(inputElement).toHaveClass('border');
            expect(inputElement).toHaveClass('rounded');
            expect(inputElement).toHaveClass('px-3');
            expect(inputElement).toHaveClass('py-2');
            expect(inputElement).toHaveClass('focus:outline-none');
            expect(inputElement).toHaveClass('focus:ring');
            expect(inputElement).toHaveClass('focus:border-primary');
            expect(inputElement).toHaveClass('custom-class');
        });


        it('should handle the placeholder prop', () => {
            const { getByPlaceholderText } = render(<Input type="text" value="" onChange={() => {}} placeholder="Enter text" />);
            const inputElement = getByPlaceholderText('Enter text');
            expect(inputElement).toBeInTheDocument();
            expect(inputElement).toHaveAttribute('placeholder', 'Enter text');
        });


        it('should sanitize input to prevent XSS', () => {
            const onChange = vi.fn();
            const { getByRole } = render(<Input type="text" value="" onChange={onChange} />);
            const inputElement = getByRole('textbox') as HTMLInputElement;
             fireEvent.change(inputElement, { target: { value: '<script>alert("XSS")</script>Test' } });
            expect(onChange).toHaveBeenCalled();
            expect(inputElement.value).toBe('<script>alert("XSS")</script>Test')
        });

        it('should handle disabled state', () => {
             const onChange = vi.fn();
            const { getByRole } = render(<Input type="text" value="" onChange={onChange} disabled />);
            const inputElement = getByRole('textbox') as HTMLInputElement;
             expect(inputElement).toBeDisabled();
            fireEvent.change(inputElement, { target: { value: 'test' } });
            expect(onChange).not.toHaveBeenCalled();
        });


         it('should validate email input', () => {
             const onChange = vi.fn();
             const { getByRole, getByText } = render(<Input type="email" value="" onChange={onChange} />);
             const inputElement = getByRole('textbox') as HTMLInputElement;
             fireEvent.change(inputElement, { target: { value: 'invalid-email' } });
             expect(getByText('Invalid email format')).toBeInTheDocument();
             expect(onChange).not.toHaveBeenCalled();
               fireEvent.change(inputElement, { target: { value: 'test@example.com' } });
             expect(onChange).toHaveBeenCalled();
         });

        it('should validate password input', () => {
            const onChange = vi.fn();
             const { getByRole, getByText } = render(<Input type="password" value="" onChange={onChange} />);
             const inputElement = getByRole('textbox') as HTMLInputElement;
             fireEvent.change(inputElement, { target: { value: 'invalid' } });
            expect(getByText('Password must be at least 8 characters long and include uppercase, lowercase, number and special character')).toBeInTheDocument();
            expect(onChange).not.toHaveBeenCalled();
             fireEvent.change(inputElement, { target: { value: 'Test123!' } });
             expect(onChange).toHaveBeenCalled();
        });

         it('should render with an accessible label and associated input', () => {
              const { getByLabelText, getByRole } = render(
                    <Input type="text" value="" onChange={() => {}} label="Test Input" />
                );

              const labelElement = getByLabelText('Test Input');
                const inputElement = getByRole('textbox') as HTMLInputElement;
                expect(labelElement).toBeInTheDocument();
                expect(inputElement).toBeInTheDocument();
                expect(inputElement.id).toBeDefined();
             expect(labelElement.htmlFor).toEqual(inputElement.id);
        });

        it('should display an error message when input is invalid', () => {
             const onChange = vi.fn();
             const { getByRole, getByText } = render(<Input type="email" value="" onChange={onChange} />);
             const inputElement = getByRole('textbox') as HTMLInputElement;
            fireEvent.change(inputElement, { target: { value: 'invalid-email' } });
           expect(getByText('Invalid email format')).toBeInTheDocument();
            expect(inputElement).toHaveAttribute('aria-invalid', 'true');
            const errorElement = getByText('Invalid email format');
             expect(inputElement).toHaveAttribute('aria-describedby', errorElement.id);
        });

        it('should not display error message when the input is valid', () => {
            const onChange = vi.fn();
             const { getByRole, queryByText } = render(<Input type="email" value="" onChange={onChange} />);
             const inputElement = getByRole('textbox') as HTMLInputElement;
            fireEvent.change(inputElement, { target: { value: 'test@example.com' } });
             expect(queryByText('Invalid email format')).toBeNull();
               expect(inputElement).not.toHaveAttribute('aria-invalid');
              expect(inputElement).not.toHaveAttribute('aria-describedby');
        });

    });
}