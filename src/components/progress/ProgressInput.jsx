import React, { useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import Input from '../common/Input';
import Button from '../common/Button';
import DOMPurify from 'dompurify';
import { CalendarIcon } from '@heroicons/react/24/outline';


const ProgressInput = () => {
    const [value, setValue] = useState('');
    const [date, setDate] = useState('');
    const [valueError, setValueError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const { loading, error, request } = useApi();

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        setValueError(null);
        setDateError(null);

        let sanitizedValue = "";
        let sanitizedDate = "";
        try {
          sanitizedValue = DOMPurify.sanitize(value);
          sanitizedDate = DOMPurify.sanitize(date);
        } catch (error) {
           console.error("Error sanitizing input:", error);
            setValueError("Invalid input");
          return;
        }


        const trimmedValue = sanitizedValue.trim();
        const trimmedDate = sanitizedDate.trim();


       if (!trimmedValue) {
          setValueError('Value is required');
            return;
        }

      if (isNaN(Number(trimmedValue))) {
        setValueError('Value must be a number');
            return;
       }


        if (!trimmedDate) {
            setDateError('Date is required');
            return;
        }



        try {
            const progressData = {
                value: Number(trimmedValue),
                date: trimmedDate,
            };
            await request('/api/progress', 'post', progressData);
            console.log('Progress added successfully!');
            setValue('');
            setDate('');
        } catch (apiError: any) {
            console.error('Failed to add progress:', apiError);
        }
    }, [value, date, request]);


    const handleValueChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
         let sanitizedValue = "";
          try {
            sanitizedValue = DOMPurify.sanitize(event.target.value);
          } catch (error) {
             console.error("Error sanitizing input:", error);
            setValueError("Invalid Input");
           return;
          }
         setValue(sanitizedValue);
        setValueError(null);
    }, []);

    const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
         let sanitizedValue = "";
          try {
            sanitizedValue = DOMPurify.sanitize(event.target.value);
          } catch (error) {
             console.error("Error sanitizing input:", error);
            setDateError("Invalid Input");
            return;
          }
          setDate(sanitizedValue);
        setDateError(null);
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Track Progress</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="number"
                    value={value}
                    onChange={handleValueChange}
                    placeholder="Progress Value"
                    label="Value"
                    className="w-full"
                     aria-invalid={!!valueError}
                      aria-describedby={valueError ? 'value-error' : undefined}
                />
                 {valueError && <p id="value-error" className="text-error text-sm mt-1">{valueError}</p>}
                <Input
                    type="date"
                    value={date}
                    onChange={handleDateChange}
                    placeholder="Date"
                    label="Date"
                    className="w-full"
                     aria-invalid={!!dateError}
                      aria-describedby={dateError ? 'date-error' : undefined}
                />
                {dateError && <p id="date-error" className="text-error text-sm mt-1">{dateError}</p>}
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Adding...' : 'Add Progress'}
                </Button>
                {error && (
                    <div className="text-error mt-2">
                        {error.message || 'Failed to add progress. Please try again.'}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ProgressInput;


if (import.meta.vitest) {
  const { describe, it, expect, vi, afterEach } = import.meta.vitest;
  const { render, fireEvent, screen, waitFor } = import('@testing-library/react');
    vi.mock('../../hooks/useApi', () => ({
      useApi: () => ({
          loading: false,
          error: null,
           request: vi.fn(),
       }),
    }));

  describe('ProgressInput Component', () => {
        afterEach(() => {
           vi.clearAllMocks();
      });

    it('should render input fields and submit button', () => {
      render(<ProgressInput />);
      expect(screen.getByPlaceholderText('Progress Value')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Date')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Progress' })).toBeInTheDocument();
    });


    it('should update the value state on input change', () => {
       render(<ProgressInput />);
      const valueInput = screen.getByPlaceholderText('Progress Value') as HTMLInputElement;
      fireEvent.change(valueInput, { target: { value: '100' } });
       expect(valueInput.value).toBe('100');
    });


     it('should update the date state on input change', () => {
         render(<ProgressInput />);
        const dateInput = screen.getByPlaceholderText('Date') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2024-07-20' } });
        expect(dateInput.value).toBe('2024-07-20');
    });


    it('should call handleSubmit with correct data on form submission', async () => {
        const requestMock = vi.fn().mockResolvedValue({});
        vi.mock('../../hooks/useApi', () => ({
            useApi: () => ({
                loading: false,
                error: null,
               request: requestMock,
          }),
        }));
         render(<ProgressInput />);
        const valueInput = screen.getByPlaceholderText('Progress Value') as HTMLInputElement;
        const dateInput = screen.getByPlaceholderText('Date') as HTMLInputElement;
        const submitButton = screen.getByRole('button', { name: 'Add Progress' });


        fireEvent.change(valueInput, { target: { value: '100' } });
        fireEvent.change(dateInput, { target: { value: '2024-07-20' } });
        fireEvent.click(submitButton);


        await waitFor(() =>  expect(requestMock).toHaveBeenCalledWith('/api/progress', 'post', {
            value: 100,
           date: '2024-07-20',
        }));
    });

       it('should display an error message if API request fails', async () => {
            const requestMock = vi.fn().mockRejectedValue({ message: 'API Error' });
            vi.mock('../../hooks/useApi', () => ({
               useApi: () => ({
                  loading: false,
                   error: { message: 'API Error' },
                 request: requestMock,
                }),
           }));
         render(<ProgressInput />);
            const valueInput = screen.getByPlaceholderText('Progress Value') as HTMLInputElement;
            const dateInput = screen.getByPlaceholderText('Date') as HTMLInputElement;
            const submitButton = screen.getByRole('button', { name: 'Add Progress' });

             fireEvent.change(valueInput, { target: { value: '100' } });
            fireEvent.change(dateInput, { target: { value: '2024-07-20' } });
            fireEvent.click(submitButton);
             await waitFor(() => expect(screen.getByText('API Error')).toBeInTheDocument());
       });


       it('should handle input validation and display error messages', async () => {
             render(<ProgressInput />);
            const submitButton = screen.getByRole('button', { name: 'Add Progress' });
             fireEvent.click(submitButton);

           await waitFor(() => expect(screen.getByText('Value is required')).toBeInTheDocument());
             await waitFor(() =>  expect(screen.getByText('Date is required')).toBeInTheDocument());


           const valueInput = screen.getByPlaceholderText('Progress Value') as HTMLInputElement;
             const dateInput = screen.getByPlaceholderText('Date') as HTMLInputElement;
             fireEvent.change(valueInput, { target: { value: 'test' } });
             fireEvent.change(dateInput, { target: { value: 'invalid' } });
              fireEvent.click(submitButton);
               await waitFor(() =>  expect(screen.getByText('Value must be a number')).toBeInTheDocument());


       });


      it('should clear input fields after successful submission', async () => {
            const requestMock = vi.fn().mockResolvedValue({});
            vi.mock('../../hooks/useApi', () => ({
                useApi: () => ({
                    loading: false,
                   error: null,
                   request: requestMock
               }),
           }));
            render(<ProgressInput />);
             const valueInput = screen.getByPlaceholderText('Progress Value') as HTMLInputElement;
             const dateInput = screen.getByPlaceholderText('Date') as HTMLInputElement;
            const submitButton = screen.getByRole('button', { name: 'Add Progress' });


            fireEvent.change(valueInput, { target: { value: '100' } });
            fireEvent.change(dateInput, { target: { value: '2024-07-20' } });
            fireEvent.click(submitButton);
             await waitFor(() =>   expect(valueInput.value).toBe(''));
             await waitFor(() => expect(dateInput.value).toBe(''));
      });
  });
}