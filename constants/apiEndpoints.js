const apiEndpoints = {
    auth: {
        signup: '/auth/signup',
        login: '/auth/login',
    },
    users: {
        me: '/users/me',
    },
    goals: {
        goals: '/goals',
        goalById: '/goals/:goalId',
    },
    progress: {
        progress: '/progress',
        progressByGoalId: '/progress/:goalId',
    },
};

export default apiEndpoints;