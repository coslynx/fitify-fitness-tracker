import React, { createContext, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Define the user type based on JWT payload
interface User {
  [key: string]: any;
  sub: string;
  email?: string;
  name?: string;
  // Add other properties as needed
}


interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => {
      try {
         const storedToken = localStorage.getItem('token');
         return storedToken || null;
      } catch (error) {
        console.error("Error accessing local storage:", error);
        return null;
      }
    });

    const login = (token: string) => {

        if (!token || token.trim() === '') {
            console.error("Token is null or empty");
            setUser(null);
            setToken(null);
            return;
        }
        try {
             localStorage.setItem('token', token);
            const decodedToken = jwtDecode<User>(token);
             setUser(decodedToken);
             setToken(token);
             navigate('/dashboard');
        } catch (error) {
            console.error("Error decoding or saving token:", error);
            setUser(null);
            setToken(null);
        }
    };

    const logout = () => {
       try {
            localStorage.removeItem('token');
       } catch(error) {
          console.error("Error accessing local storage:", error);
       }
       setUser(null);
       setToken(null);
       navigate('/');
    };
    

    const contextValue = useMemo(() => ({
        user,
        token,
        login,
        logout,
    }), [user, token, login, logout]);
    
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Example usage for testing
if (import.meta.vitest) {
  const { describe, it, expect, vi, afterEach } = import.meta.vitest;

  describe('AuthContext', () => {
    afterEach(() => {
      localStorage.clear();
      vi.clearAllMocks();
    });

      it('should initialize with null user and token if no token in localStorage', () => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );
          let auth;
          
          function TestComponent() {
              auth = useAuth();
              return <></>
          }

          function render() {
             return <wrapper><TestComponent /></wrapper>
          }

          render();


          expect(auth.user).toBeNull();
          expect(auth.token).toBeNull();
      });

    it('should log in a user and store the token', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
             <AuthProvider>{children}</AuthProvider>
        );
          let auth;
          
          function TestComponent() {
             auth = useAuth();
              return <></>
          }

          function render() {
               return  <wrapper><TestComponent /></wrapper>
          }

          render();


          const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJlbWFpbCI6ImpvaG5kb2VAZXhhbXBsZS5jb20ifQ.dQ7w500tq5XjJj6r9o_P6q6k7a7c2o_V5q5l2Y0uQ';
           auth.login(testToken);

         expect(auth.token).toEqual(testToken);
          expect(auth.user?.sub).toEqual('1234567890');
          expect(auth.user?.name).toEqual('John Doe');
          expect(auth.user?.email).toEqual('johndoe@example.com');
          expect(localStorage.getItem('token')).toEqual(testToken);
    });

      it('should log out a user and clear the token', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );
        let auth;
        
          function TestComponent() {
             auth = useAuth();
            return <></>
         }

         function render() {
                return  <wrapper><TestComponent /></wrapper>
         }

         render();

         const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJlbWFpbCI6ImpvaG5kb2VAZXhhbXBsZS5jb20ifQ.dQ7w500tq5XjJj6r9o_P6q6k7a7c2o_V5q5l2Y0uQ';
          auth.login(testToken);
          auth.logout();

         expect(auth.user).toBeNull();
         expect(auth.token).toBeNull();
         expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle invalid token by setting user and token as null', () => {
         const wrapper = ({ children }: { children: React.ReactNode }) => (
          <AuthProvider>{children}</AuthProvider>
         );

         let auth;
        
        function TestComponent() {
          auth = useAuth();
           return <></>
         }

         function render() {
            return  <wrapper><TestComponent /></wrapper>
         }
         render();
        const invalidToken = 'invalid-jwt-token';
        auth.login(invalidToken);
        expect(auth.user).toBeNull();
        expect(auth.token).toBeNull();
    });
  });
}