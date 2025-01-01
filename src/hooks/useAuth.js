import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext';

// Define the user type based on JWT payload
interface User {
    [key: string]: any;
    sub: string;
    email?: string;
    name?: string;
    // Add other properties as needed
}


interface AuthHookType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}


export const useAuth = (): AuthHookType => {
    const { user: contextUser, token: contextToken, login: contextLogin, logout: contextLogout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(contextUser);
    const [token, setToken] = useState<string | null>(contextToken);

    const login = (token: string) => {
        if (!token || token.trim() === '') {
            console.error("Token is null or empty");
            setUser(null);
            setToken(null);
            contextLogin(null);
            return;
        }
        try {
            localStorage.setItem('token', token);
            const decodedToken = jwtDecode<User>(token);
            setUser(decodedToken);
            setToken(token);
            contextLogin(token)
            navigate('/dashboard');
        } catch (error) {
            console.error("Error decoding or saving token:", error);
            setUser(null);
            setToken(null);
            contextLogin(null);
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem('token');
        } catch (error) {
            console.error("Error accessing local storage:", error);
        }
        setUser(null);
        setToken(null);
        contextLogout();
        navigate('/');
    };

    return {
        user,
        token,
        login,
        logout,
    };
};