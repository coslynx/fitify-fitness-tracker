import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface Goal {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

const GoalList: React.FC = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const { loading, error, request } = useApi<Goal[]>();

    useEffect(() => {
        const fetchGoals = async () => {
            try {
               const fetchedGoals = await request('/api/goals', 'get');
               if(fetchedGoals) {
                    setGoals(fetchedGoals);
               } else {
                   console.error("No goals fetched");
               }
            } catch (apiError) {
                console.error('Failed to fetch goals:', apiError);
            }
        };

        fetchGoals();
    }, [request]);

    if (loading) {
        return <div className="text-center">Loading goals...</div>;
    }

    if (error) {
         return <div className="text-error text-center">Error fetching goals: {error.message || 'Unknown error'}</div>;
    }

    if (goals.length === 0) {
        return <div className="text-center">No goals set yet.</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Your Goals</h2>
            <ul className="space-y-4">
                {goals.map(goal => (
                    <li key={goal._id} className="bg-white shadow rounded p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                            <p className="text-gray-600">{goal.description}</p>
                        </div>
                        <CheckCircleIcon className="h-6 w-6 text-accent" aria-hidden="true"/>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GoalList;


if (import.meta.vitest) {
    const { describe, it, expect, vi, afterEach } = import.meta.vitest;
    const { render, screen, waitFor } = import('@testing-library/react');

    const mockGoals = [
        { _id: '1', name: 'Goal 1', description: 'Description 1', createdAt: '2024-07-17T12:00:00.000Z', updatedAt: '2024-07-17T12:00:00.000Z' },
        { _id: '2', name: 'Goal 2', description: 'Description 2', createdAt: '2024-07-17T13:00:00.000Z', updatedAt: '2024-07-17T13:00:00.000Z' },
    ];

    const mockEmptyGoals = [];

    describe('GoalList Component', () => {
        afterEach(() => {
             vi.clearAllMocks();
        });

         it('should display loading message while fetching goals', () => {
            vi.mock('../../hooks/useApi', () => ({
               useApi: () => ({
                  loading: true,
                   error: null,
                    request: vi.fn(),
               }),
           }));
            render(<GoalList />);
            expect(screen.getByText('Loading goals...')).toBeInTheDocument();
        });

       it('should display error message if fetching goals fails', async () => {
            vi.mock('../../hooks/useApi', () => ({
                 useApi: () => ({
                   loading: false,
                   error: { message: 'Failed to fetch goals' },
                  request: vi.fn(),
                 }),
            }));
           render(<GoalList />);
           await waitFor(() =>  expect(screen.getByText('Error fetching goals: Failed to fetch goals')).toBeInTheDocument());
        });

         it('should display "No goals set yet." if there are no goals', async () => {
           vi.mock('../../hooks/useApi', () => ({
              useApi: () => ({
                 loading: false,
                error: null,
                request: vi.fn().mockResolvedValue(mockEmptyGoals)
              }),
          }));
         render(<GoalList />);
           await waitFor(() => expect(screen.getByText('No goals set yet.')).toBeInTheDocument());
        });

        it('should render a list of goals', async () => {
             vi.mock('../../hooks/useApi', () => ({
                useApi: () => ({
                    loading: false,
                    error: null,
                    request: vi.fn().mockResolvedValue(mockGoals)
                }),
            }));
             render(<GoalList />);
             await waitFor(() =>  expect(screen.getByText('Goal 1')).toBeInTheDocument());
             await waitFor(() =>  expect(screen.getByText('Goal 2')).toBeInTheDocument());
            expect(screen.getByText('Description 1')).toBeInTheDocument();
             expect(screen.getByText('Description 2')).toBeInTheDocument();
            expect(screen.getAllByRole('listitem').length).toBe(mockGoals.length);
        });
    });
}