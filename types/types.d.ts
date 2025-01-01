// Define the user type based on JWT payload
export interface User {
    [key: string]: any;
    sub: string;
    email?: string;
    name?: string;
}

export interface Goal {
    _id: string;
    name: string;
    description: string;
    targetValue: number;
    unit: 'kg' | 'lbs' | 'steps' | 'miles' | 'km' | 'minutes';
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
     userId: string;
}


export interface Progress {
    _id: string;
    date: string;
    value: number;
    userId: string;
    goalId: string;
     createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    loading: boolean;
    data: T | null;
    error: any;
    request: (url: string, method: 'get' | 'post' | 'put' | 'delete', data?: any) => Promise<T>;
}

export interface AuthHookType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}