import { useState, useCallback } from 'react';
import axios from 'axios';

interface ApiResponse<T> {
    loading: boolean;
    data: T | null;
    error: any;
    request: (url: string, method: 'get' | 'post' | 'put' | 'delete', data?: any) => Promise<T>;
}


export const useApi = <T>(): ApiResponse<T> => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any>(null);

    const request = useCallback(async (url: string, method: 'get' | 'post' | 'put' | 'delete', data?: any): Promise<T> => {
        setLoading(true);
        setData(null);
        setError(null);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            if (!apiBaseUrl) {
              throw new Error("VITE_API_BASE_URL is not defined in the environment variables.");
            }
            const axiosConfig = {
                method,
                url: `${apiBaseUrl}${url}`,
                data,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await axios(axiosConfig);

            if (response.status >= 200 && response.status < 300) {
              setData(response.data);
                console.log('API request successful:', { url, method, data, response });
                return response.data;
            } else {
              const errorMessage = `API request failed with status code: ${response.status}`;
              console.error(errorMessage, { url, method, data, response });
                setError({ message: errorMessage, status: response.status });
              throw new Error(errorMessage);
            }

        } catch (err: any) {
            console.error('API request failed:', err);
            let errorMessage = 'An unexpected error occurred.';
            if (axios.isAxiosError(err)) {
                const errorResponse = err.response;
                if(errorResponse) {
                    const statusCode = errorResponse.status;
                    if (statusCode === 401) {
                        errorMessage = 'Unauthorized access. Please log in again.';
                    } else if(statusCode === 403) {
                        errorMessage = 'Access forbidden. You do not have permission to access this resource';
                    } else if (statusCode === 404) {
                        errorMessage = 'Resource not found. Please check the URL.';
                    }
                    else{
                        errorMessage = errorResponse.data?.message ||  `API request failed with status code: ${statusCode}`;
                    }

                } else {
                    errorMessage = err.message || errorMessage;
                }
            }
             setError({ message: errorMessage, ...err });
             throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, data, error, request };
};