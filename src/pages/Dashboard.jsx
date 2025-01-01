import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoalForm from '../components/goals/GoalForm';
import GoalList from '../components/goals/GoalList';
import ProgressChart from '../components/progress/ProgressChart';
import ProgressInput from '../components/progress/ProgressInput';


const Dashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
     const [progressData, setProgressData] = useState<{ date: string; value: number }[] | null>(null);



    const fetchProgressData = useCallback(async () => {
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            if (!apiBaseUrl) {
                throw new Error("VITE_API_BASE_URL is not defined in the environment variables.");
            }

             const headers = new Headers();
             if(token) {
                 headers.append('Authorization', `Bearer ${token}`);
              }
              const response = await fetch(`${apiBaseUrl}/api/progress`, {
                 method: 'GET',
                   headers: headers,
             });
             if (!response.ok) {
                 let errorMessage =  `Failed to fetch progress with status: ${response.status}`;
                    try {
                           const errorData = await response.json();
                            errorMessage =  errorData.message || errorMessage;
                       } catch (parseError) {
                             console.error('Error parsing error response:', parseError);
                     }
                    throw new Error(errorMessage);
             }
            const data = await response.json();
            if (Array.isArray(data)) {
                setProgressData(data);
            } else {
                console.error('Invalid progress data format:', data);
                setProgressData(null);
            }
        } catch (fetchError: any) {
              console.error('Error fetching progress data:', fetchError);
             setError(fetchError.message || 'Failed to fetch progress data');
             setProgressData(null);
       }
     }, [token]);


    useEffect(() => {

        const checkAuth = async () => {
            setLoading(true);
           try {
                  if (!user || !token) {
                       navigate('/');
                       return;
                  }
                await fetchProgressData();

             } catch (authError: any) {
                   setError(authError.message || 'Authentication error');
                  console.error('Authentication check failed:', authError);
                   navigate('/');
             } finally {
                 setLoading(false);
            }
        };

        checkAuth();

    }, [user, token, navigate, fetchProgressData]);

      const handleLogout = useCallback(() => {
          logout();
         navigate('/');
    }, [logout, navigate]);


    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }


    if (error) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center text-red-500 font-bold mb-4">
                   {error}
                 </div>
               <button onClick={handleLogout} className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark focus:outline-none focus:ring focus:ring-primary-light">
                    Go back to Home
                </button>
           </div>
        );
    }
    if(!user) {
       return null;
     }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-700">Welcome, {user.name || 'User'}!</h2>
                 <button onClick={handleLogout} className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark focus:outline-none focus:ring focus:ring-primary-light">
                    Logout
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white shadow rounded p-4">
                    <GoalForm />
                </div>
                <div className="bg-white shadow rounded p-4">
                  <ProgressInput />
                </div>
                <div className="bg-white shadow rounded p-4 md:col-span-2">
                   <ProgressChart progressData={progressData} />
               </div>
                <div className="bg-white shadow rounded p-4 md:col-span-2">
                    <GoalList />
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

if (import.meta.vitest) {
    const { describe, it, expect, vi, afterEach } = import.meta.vitest;
     const { render, screen, waitFor } = import('@testing-library/react');
    const { AuthProvider } = import('../context/AuthContext');
    const { BrowserRouter } = import('react-router-dom');


    const mockUser = { sub: '123', name: 'Test User' };
    const mockToken = 'test-token';

     const setup = (user = mockUser, token = mockToken) => {

          const wrapper = ({ children }: { children: React.ReactNode }) => (
              <BrowserRouter><AuthProvider>{children}</AuthProvider></BrowserRouter>
          );

        vi.mock('../hooks/useAuth', () => ({
              useAuth: () => ({
                user: user,
                token: token,
                login: vi.fn(),
                 logout: vi.fn(),
            }),
        }));
       return { wrapper}

    };



    describe('Dashboard Component', () => {
      afterEach(() => {
         vi.clearAllMocks();
     });


        it('should redirect to home page if user is not authenticated', async () => {
              const { wrapper } = setup(null, null);
            render(<wrapper><Dashboard /></wrapper>);
            await waitFor(() => expect(window.location.pathname).toBe('/'));
        });


         it('should display loading message while authenticating user', () => {

           const { wrapper } = setup();
            vi.mock('../hooks/useAuth', () => ({
                useAuth: () => ({
                    user: null,
                    token: null,
                     login: vi.fn(),
                    logout: vi.fn()
                }),
            }));
             render(<wrapper><Dashboard /></wrapper>);
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });


        it('should render dashboard content if user is authenticated', async () => {
              const { wrapper } = setup();
              const mockProgress = [{date: '2024-07-21', value: 100}]
             const fetchMock = vi.fn().mockResolvedValue({
                    ok: true,
                    json: vi.fn().mockResolvedValue(mockProgress)
             });
             vi.spyOn(window, 'fetch').mockImplementation(fetchMock);
             render(<wrapper><Dashboard /></wrapper>);
          await waitFor(() =>  expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument());
             expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
           expect(screen.getByText('Add New Goal')).toBeInTheDocument();
           expect(screen.getByText('Your Goals')).toBeInTheDocument();
           expect(screen.getByText('Track Progress')).toBeInTheDocument();
            expect(screen.getByRole('img', {name: 'Progress Chart'})).toBeInTheDocument();
       });


        it('should display an error message if authentication check fails', async () => {
             const { wrapper } = setup(null, null);
             vi.mock('../hooks/useAuth', () => ({
                useAuth: () => ({
                     user: null,
                     token: null,
                     login: vi.fn(),
                     logout: vi.fn()
                }),
             }));
            render(<wrapper><Dashboard /></wrapper>);
              await waitFor(() =>  expect(screen.getByText('Authentication error')).toBeInTheDocument());
              expect(screen.getByRole('button', {name: 'Go back to Home'})).toBeInTheDocument()
         });

         it('should call logout and navigate to home on logout button click', async () => {
             const logoutMock = vi.fn();
             const { wrapper } = setup(mockUser, mockToken);
            vi.mock('../hooks/useAuth', () => ({
                useAuth: () => ({
                    user: mockUser,
                    token: mockToken,
                     login: vi.fn(),
                     logout: logoutMock
                }),
             }));


              render(<wrapper><Dashboard /></wrapper>);
               const logoutButton = screen.getByRole('button', { name: 'Logout' });
              fireEvent.click(logoutButton);
              expect(logoutMock).toHaveBeenCalled();
             await waitFor(() => expect(window.location.pathname).toBe('/'))
         });

         it('should display an error message if fetching progress data fails', async () => {
                const { wrapper } = setup(mockUser, mockToken);
                const fetchMock = vi.fn().mockResolvedValue({
                   ok: false,
                   status: 404,
                    json: vi.fn().mockResolvedValue({ message: 'Failed to fetch progress'}),
              });
            vi.spyOn(window, 'fetch').mockImplementation(fetchMock);
             render(<wrapper><Dashboard /></wrapper>);
                await waitFor(() => expect(screen.getByText('Failed to fetch progress')).toBeInTheDocument());
        });

        it('should not render ProgressChart if no progressData is fetched', async () => {
             const { wrapper } = setup();
              const fetchMock = vi.fn().mockResolvedValue({
                   ok: true,
                    json: vi.fn().mockResolvedValue([])
              });
               vi.spyOn(window, 'fetch').mockImplementation(fetchMock);
                render(<wrapper><Dashboard /></wrapper>);
             await waitFor(() => expect(screen.queryByRole('img', { name: 'Progress Chart' })).toBeNull());

       });

    });
}