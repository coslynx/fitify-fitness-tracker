import React, { useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import Input from '../common/Input';
import Button from '../common/Button';
import DOMPurify from 'dompurify';


interface GoalFormProps {
}


const GoalForm: React.FC<GoalFormProps> = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { loading, error, request } = useApi();
    const [nameError, setNameError] = useState<string | null>(null);
     const [descriptionError, setDescriptionError] = useState<string | null>(null);


    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
         setNameError(null);
        setDescriptionError(null);


        const trimmedName = name.trim();
        const trimmedDescription = description.trim();
           if(!trimmedName) {
             setNameError("Goal name is required");
             return;
            }

            if(!trimmedDescription) {
              setDescriptionError("Goal description is required");
              return;
            }


        try {
            const goalData = {
                name: trimmedName,
                description: trimmedDescription,
            };
               await request('/api/goals', 'post', goalData);
                console.log('Goal created successfully!');
                 setName('');
                 setDescription('');

        } catch (apiError: any) {
                console.error('Failed to create goal:', apiError);
        }
    }, [name, description, request]);


   const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        let sanitizedValue = "";
         try {
            sanitizedValue = DOMPurify.sanitize(inputValue);
         } catch (error) {
            console.error('Error sanitizing input:', error);
            setNameError('Invalid Input');
            return;
         }


        setName(sanitizedValue);
         setNameError(null);
   }, []);

   const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
       const inputValue = event.target.value;
       let sanitizedValue = "";
       try {
          sanitizedValue = DOMPurify.sanitize(inputValue);
       } catch (error) {
           console.error('Error sanitizing input:', error);
           setDescriptionError('Invalid Input');
           return;
       }


      setDescription(sanitizedValue);
      setDescriptionError(null);
    }, []);
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Add New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Goal Name"
                     label="Name"
                     className="w-full"
                />
                   {nameError && (
                       <p className="text-error text-sm mt-1">{nameError}</p>
                    )}
                <Input
                    type="text"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Goal Description"
                    label="Description"
                     className="w-full"
                />
                   {descriptionError && (
                       <p className="text-error text-sm mt-1">{descriptionError}</p>
                   )}
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Adding...' : 'Add Goal'}
                </Button>
                {error && (
                    <div className="text-error mt-2">
                       {error.message || 'Failed to create goal. Please try again.'}
                    </div>
                )}
            </form>
        </div>
    );
};


export default GoalForm;


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
    describe('GoalForm Component', () => {
           afterEach(() => {
              vi.clearAllMocks();
           });
        it('should render input fields and submit button', () => {
            render(<GoalForm />);
            expect(screen.getByPlaceholderText('Goal Name')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Goal Description')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Add Goal' })).toBeInTheDocument();
        });


        it('should call handleSubmit with correct data on form submission', async () => {
             const requestMock = vi.fn().mockResolvedValue({});
            vi.mock('../../hooks/useApi', () => ({
                useApi: () => ({
                    loading: false,
                    error: null,
                     request: requestMock
                }),
            }));
            render(<GoalForm />);
            const nameInput = screen.getByPlaceholderText('Goal Name') as HTMLInputElement;
            const descriptionInput = screen.getByPlaceholderText('Goal Description') as HTMLInputElement;
            const submitButton = screen.getByRole('button', { name: 'Add Goal' });


            fireEvent.change(nameInput, { target: { value: 'Test Goal' } });
            fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
            fireEvent.click(submitButton);
           await waitFor(() =>   expect(requestMock).toHaveBeenCalledWith('/api/goals', 'post', {
               name: 'Test Goal',
               description: 'Test Description',
            }));
        });

         it('should display an error message if API request fails', async () => {
            const requestMock = vi.fn().mockRejectedValue({ message: 'API Error' });
            vi.mock('../../hooks/useApi', () => ({
               useApi: () => ({
                  loading: false,
                   error: { message: 'API Error'},
                  request: requestMock
                }),
           }));
             render(<GoalForm />);
             const nameInput = screen.getByPlaceholderText('Goal Name') as HTMLInputElement;
             const descriptionInput = screen.getByPlaceholderText('Goal Description') as HTMLInputElement;
             const submitButton = screen.getByRole('button', { name: 'Add Goal' });

            fireEvent.change(nameInput, { target: { value: 'Test Goal' } });
             fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
             fireEvent.click(submitButton);
             await waitFor(() => expect(screen.getByText('API Error')).toBeInTheDocument());
         });


         it('should handle input validation and display error messages', async () => {
              render(<GoalForm />);
             const submitButton = screen.getByRole('button', { name: 'Add Goal' });
            const nameInput = screen.getByPlaceholderText('Goal Name') as HTMLInputElement;
            const descriptionInput = screen.getByPlaceholderText('Goal Description') as HTMLInputElement;

             fireEvent.click(submitButton);
             await waitFor(() => expect(screen.getByText('Goal name is required')).toBeInTheDocument());
              await waitFor(() => expect(screen.getByText('Goal description is required')).toBeInTheDocument());


               fireEvent.change(nameInput, { target: { value: '<script>alert("XSS")</script>' } });
              fireEvent.change(descriptionInput, { target: { value: '<script>alert("XSS")</script>' } });
              fireEvent.click(submitButton);
              await waitFor(() =>  expect(screen.getByText('Invalid Input')).toBeInTheDocument());

        });
    });
}