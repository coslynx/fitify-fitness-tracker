import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {  ArrowLeftIcon, LockClosedIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';


const AuthForms = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalError, setModalError] = useState(null);
    const { login } = useAuth();
    const { loading, error, request } = useApi();
    const navigate = useNavigate();

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
         setModalError(null);
        try {
            const authData = {
                email: email.trim(),
                password: password.trim(),
                ...(isLoginMode ? {} : { name: name.trim() }),
            };

            const endpoint = isLoginMode ? '/auth/login' : '/auth/signup';
            const response = await request(endpoint, 'post', authData);
              if (response && response.token) {
                 await login(response.token);
                 setModalMessage(isLoginMode ? 'Logged in successfully!' : 'Signed up successfully!');
                 setShowModal(true);
                 setTimeout(() => {
                   setShowModal(false);
                    navigate('/dashboard');
                }, 2000);
                } else {
                  setModalError('An unexpected error occurred. Please try again.');
                }
        } catch (apiError: any) {
                console.error('Authentication failed:', apiError);
               if (apiError && apiError.message) {
                  setModalError(apiError.message);
               } else {
                setModalError('An unexpected error occurred. Please try again.');
             }
                setShowModal(true);
           
        }

    }, [email, password, name, isLoginMode, login, request, navigate]);


    const toggleAuthMode = useCallback(() => {
        setIsLoginMode(prevMode => !prevMode);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setModalError(null);
    }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Modal show={showModal} onClose={handleCloseModal}>
            {modalError ? <div className="text-error">{modalError}</div> : <div className="text-accent">{modalMessage}</div>}
        </Modal>
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginMode && (
                  <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                       placeholder="Your Name"
                       label="Name"
                      className="w-full"
                     />
                )}
                 <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    label="Email"
                    className="w-full"
                      />
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    label="Password"
                    className="w-full"
                     />

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Loading...' : isLoginMode ? 'Log In' : 'Sign Up'}
                </Button>

                 <div className="flex justify-between items-center">
                      <button type="button" onClick={toggleAuthMode} className="text-primary  focus:outline-none flex items-center">
                          <ArrowLeftIcon className="h-4 w-4 mr-1"/>
                         {isLoginMode ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                      </button>
                 </div>
            </form>
        </div>
    </div>
  );
};

export default AuthForms;


if (import.meta.vitest) {
    const { describe, it, expect, vi, afterEach } = import.meta.vitest;
    const { render, fireEvent, screen, waitFor } = import('@testing-library/react');
    const { AuthProvider } = import('../../context/AuthContext')
    const { BrowserRouter } = import('react-router-dom')

  describe('AuthForms Component', () => {
        afterEach(() => {
            vi.clearAllMocks();
        });

         it('should display error message on login failure', async () => {
           const wrapper = ({ children }: { children: React.ReactNode }) => (
            <BrowserRouter><AuthProvider>{children}</AuthProvider></BrowserRouter>
        );


            const requestMock = vi.fn().mockRejectedValue({ message: 'Invalid credentials' });
             vi.mock('../../hooks/useApi', () => ({
                useApi: () => ({
                  loading: false,
                  error: null,
                  request: requestMock,
                }),
             }));


            render(<wrapper><AuthForms /></wrapper>);
              const emailInput = screen.getByPlaceholderText('Email Address') as HTMLInputElement;
              const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
            const loginButton = screen.getByRole('button', { name: 'Log In' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
            fireEvent.click(loginButton);
          await waitFor(() =>  expect(requestMock).toHaveBeenCalled())
            await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());

       });


         it('should call login on successful login', async () => {
             const loginMock = vi.fn();
             const requestMock = vi.fn().mockResolvedValue({token: 'test-token'});
             vi.mock('../../hooks/useApi', () => ({
                  useApi: () => ({
                     loading: false,
                     error: null,
                     request: requestMock,
                  }),
             }));

            vi.mock('../../hooks/useAuth', () => ({
                 useAuth: () => ({
                   login: loginMock,
                 }),
            }));


              const wrapper = ({ children }: { children: React.ReactNode }) => (
                <BrowserRouter><AuthProvider>{children}</AuthProvider></BrowserRouter>
            );


          render(<wrapper><AuthForms /></wrapper>);
            const emailInput = screen.getByPlaceholderText('Email Address') as HTMLInputElement;
            const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
              const loginButton = screen.getByRole('button', { name: 'Log In' });


            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
            fireEvent.click(loginButton);
          await waitFor(() => expect(requestMock).toHaveBeenCalled())
             await waitFor(() => expect(loginMock).toHaveBeenCalledWith('test-token'));


         });


    it('should call login on successful signup', async () => {
           const loginMock = vi.fn();
         const requestMock = vi.fn().mockResolvedValue({token: 'test-token'});
            vi.mock('../../hooks/useApi', () => ({
               useApi: () => ({
                 loading: false,
                 error: null,
                 request: requestMock,
               }),
            }));
           vi.mock('../../hooks/useAuth', () => ({
              useAuth: () => ({
                login: loginMock,
              }),
           }));

           const wrapper = ({ children }: { children: React.ReactNode }) => (
                <BrowserRouter><AuthProvider>{children}</AuthProvider></BrowserRouter>
           );
         render(<wrapper><AuthForms /></wrapper>);
           const nameInput = screen.getByPlaceholderText('Your Name') as HTMLInputElement;
           const emailInput = screen.getByPlaceholderText('Email Address') as HTMLInputElement;
           const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
           const signUpButton = screen.getByRole('button', { name: 'Sign Up' });
            const toggleButton = screen.getByRole('button', {name: 'Need an account? Sign Up'})

            fireEvent.click(toggleButton)
          await waitFor(() => expect(nameInput).toBeInTheDocument());
           fireEvent.change(nameInput, { target: { value: 'Test User' } });
           fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
           fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

         fireEvent.click(signUpButton);
           await waitFor(() => expect(requestMock).toHaveBeenCalled())
          await waitFor(() => expect(loginMock).toHaveBeenCalledWith('test-token'));
      });



       it('should toggle between login and signup mode', async () => {
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <BrowserRouter><AuthProvider>{children}</AuthProvider></BrowserRouter>
           );
           render(<wrapper><AuthForms /></wrapper>);

            const signUpButton = screen.getByRole('button', {name: 'Need an account? Sign Up'});
           expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
            fireEvent.click(signUpButton);
            expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Your Name')).toBeInTheDocument();
             const loginButton = screen.getByRole('button', {name: 'Already have an account? Log In'});
          fireEvent.click(loginButton);
            expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
            expect(screen.queryByPlaceholderText('Your Name')).not.toBeInTheDocument();
       });
    });
}