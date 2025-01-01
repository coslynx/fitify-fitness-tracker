import supertest from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import mainController from '../api/controllers/mainController.js';
import connectDB from '../api/config/db.js';
import User from '../api/models/User.js';
import Goal from '../api/models/Goal.js';
import Progress from '../api/models/Progress.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', mainController);

const request = supertest(app);

const testDbUrl = process.env.VITE_DATABASE_URL + '_test';
const VITE_JWT_SECRET = process.env.VITE_JWT_SECRET;

if (!VITE_JWT_SECRET) {
    throw new Error('VITE_JWT_SECRET is not defined in the environment variables.');
}

describe('API Endpoints', () => {
    beforeEach(async () => {
        try {
             await mongoose.connect(testDbUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        } catch (error) {
            console.error('Error connecting to test database:', error);
            throw error;
        }
    });

    afterEach(async () => {
          try {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        } catch (error) {
            console.error('Error dropping/closing test database:', error);
            throw error;
        }
    });


    describe('User Authentication', () => {
        it('should register a new user', async () => {
             const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'TestPassword1!',
             };
            const response = await request.post('/api/auth/signup').send(userData);
             expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
           expect(response.body).toHaveProperty('username', userData.username);
            expect(response.body).toHaveProperty('email', userData.email);
            expect(response.body).not.toHaveProperty('password');
            const user = await User.findOne({email: userData.email});
            expect(user).toBeDefined();
            expect(user?.email).toEqual(userData.email);

        });

        it('should not register a user with invalid data', async () => {
              const invalidUserData = {
                username: 'te',
                email: 'invalid-email',
                password: 'test',
            };
            const response = await request.post('/api/auth/signup').send(invalidUserData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors).toBeInstanceOf(Array);
             const user = await User.findOne({email: invalidUserData.email});
             expect(user).toBeNull();
        });

          it('should handle duplicate usernames', async () => {
            const userData1 = {
                username: 'testuser',
                email: 'test1@example.com',
                password: 'TestPassword1!',
            };
            const userData2 = {
                username: 'testuser',
                email: 'test2@example.com',
                password: 'TestPassword2!',
            };

            await request.post('/api/auth/signup').send(userData1);
            const response = await request.post('/api/auth/signup').send(userData2);
            expect(response.status).toBe(409);
             expect(response.body).toHaveProperty('message', 'Username already exists');
              const user1 = await User.findOne({email: userData1.email});
            const user2 = await User.findOne({email: userData2.email});
             expect(user1).toBeDefined();
             expect(user2).toBeNull();
        });

         it('should handle duplicate emails', async () => {
              const userData1 = {
                username: 'testuser1',
                email: 'test@example.com',
                password: 'TestPassword1!',
            };
            const userData2 = {
                username: 'testuser2',
                email: 'test@example.com',
                password: 'TestPassword2!',
            };
             await request.post('/api/auth/signup').send(userData1);
             const response = await request.post('/api/auth/signup').send(userData2);
              expect(response.status).toBe(409);
               expect(response.body).toHaveProperty('message', 'Email already exists');
             const user1 = await User.findOne({email: userData1.email});
            const user2 = await User.findOne({email: userData2.email});
             expect(user1).toBeDefined();
             expect(user2).toBeNull();
        });



        it('should log in an existing user', async () => {
            const userData = {
                 username: 'testuser',
                 email: 'test@example.com',
                 password: 'TestPassword1!',
             };
              await request.post('/api/auth/signup').send(userData);
             const loginData = {
                email: userData.email,
                password: userData.password,
            };
            const response = await request.post('/api/auth/login').send(loginData);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
             const user = await User.findOne({email: loginData.email});
              expect(user).toBeDefined();
            const decodedToken = jwt.decode(response.body.token);
               expect(decodedToken).toHaveProperty('sub', user?._id.toString());
            expect(decodedToken).toHaveProperty('email', loginData.email);
            expect(decodedToken).toHaveProperty('name', userData.username);

        });

         it('should not log in a user with invalid credentials', async () => {
            const userData = {
                 username: 'testuser',
                 email: 'test@example.com',
                 password: 'TestPassword1!',
             };
             await request.post('/api/auth/signup').send(userData);
            const invalidLoginData = {
                email: userData.email,
                password: 'wrongpassword',
             };
            const response = await request.post('/api/auth/login').send(invalidLoginData);
             expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid credentials');
        });


        it('should get the current user\'s profile', async () => {
           const userData = {
                username: 'testuser',
                 email: 'test@example.com',
                password: 'TestPassword1!',
            };
              await request.post('/api/auth/signup').send(userData);
             const loginData = {
                email: userData.email,
                password: userData.password,
            };
           const loginResponse = await request.post('/api/auth/login').send(loginData);
             expect(loginResponse.status).toBe(200);
           const token = loginResponse.body.token;
          const response = await request.get('/api/users/me')
              .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
              expect(response.body).toHaveProperty('_id');
           expect(response.body).toHaveProperty('username', userData.username);
            expect(response.body).toHaveProperty('email', userData.email);
          expect(response.body).not.toHaveProperty('password');

        });


         it('should not get the current user\'s profile if token is invalid', async () => {
           const response = await request.get('/api/users/me')
                .set('Authorization', `Bearer invalid-token`);
            expect(response.status).toBe(401);
             expect(response.body).toHaveProperty('message', 'Unauthorized');
        });

        it('should return 404 if user is not found', async () => {
             const mockToken = jwt.sign({ sub: 'invalid-user-id' }, VITE_JWT_SECRET);
               const response = await request.get('/api/users/me')
                .set('Authorization', `Bearer ${mockToken}`);
               expect(response.status).toBe(404);
               expect(response.body).toHaveProperty('message', 'User not found');
        });

    });


    describe('Goal Management', () => {

        let token;
         beforeEach(async () => {
            const userData = {
                 username: 'testuser',
                email: 'test@example.com',
                password: 'TestPassword1!',
            };
              await request.post('/api/auth/signup').send(userData);
             const loginData = {
                 email: userData.email,
                 password: userData.password,
            };
           const loginResponse = await request.post('/api/auth/login').send(loginData);
             expect(loginResponse.status).toBe(200);
              token = loginResponse.body.token;
        });

        it('should create a new goal', async () => {
            const goalData = {
                name: 'Run a marathon',
                 description: 'Train to run a full marathon',
               targetValue: 26.2,
                unit: 'miles',
                startDate: '2024-08-01',
                endDate: '2024-12-31',
            };
           const response = await request
                .post('/api/goals')
                .set('Authorization', `Bearer ${token}`)
                .send(goalData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name', goalData.name);
             expect(response.body).toHaveProperty('description', goalData.description);
            expect(response.body).toHaveProperty('targetValue', goalData.targetValue);
             expect(response.body).toHaveProperty('unit', goalData.unit);
            expect(response.body).toHaveProperty('startDate', new Date(goalData.startDate).toISOString());
           expect(response.body).toHaveProperty('endDate', new Date(goalData.endDate).toISOString());
             const goal = await Goal.findOne({name: goalData.name});
            expect(goal).toBeDefined();
             expect(goal?.name).toEqual(goalData.name);
        });


          it('should not create a new goal with invalid data', async () => {
            const invalidGoalData = {
               name: 'te',
                 description: 'test',
                 targetValue: -10,
                unit: 'invalid',
               startDate: 'invalid',
                 endDate: 'invalid',
            };
             const response = await request
                .post('/api/goals')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidGoalData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors).toBeInstanceOf(Array);
           const goal = await Goal.findOne({name: invalidGoalData.name});
              expect(goal).toBeNull();

        });


         it('should get all goals for the current user', async () => {
            const goalData1 = {
                 name: 'Run a marathon',
                 description: 'Train to run a full marathon',
               targetValue: 26.2,
                unit: 'miles',
                startDate: '2024-08-01',
                endDate: '2024-12-31',
             };
             const goalData2 = {
               name: 'Learn to code',
                description: 'Learn javascript',
                 targetValue: 100,
                unit: 'hours',
               startDate: '2024-07-01',
                 endDate: '2024-12-31',
           };
             await request
                .post('/api/goals')
                .set('Authorization', `Bearer ${token}`)
               .send(goalData1);
              await request
               .post('/api/goals')
               .set('Authorization', `Bearer ${token}`)
                .send(goalData2);
             const response = await request
                 .get('/api/goals')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
             expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(2);
             const goal1 = await Goal.findOne({name: goalData1.name});
            expect(response.body.some((goal) => goal._id === goal1?._id.toString())).toBe(true);
           const goal2 = await Goal.findOne({name: goalData2.name});
           expect(response.body.some((goal) => goal._id === goal2?._id.toString())).toBe(true);
        });


         it('should get a single goal by id', async () => {
            const goalData = {
                name: 'Run a marathon',
                description: 'Train to run a full marathon',
                 targetValue: 26.2,
               unit: 'miles',
                startDate: '2024-08-01',
                endDate: '2024-12-31',
            };
           const createGoalResponse = await request
                .post('/api/goals')
                 .set('Authorization', `Bearer ${token}`)
                .send(goalData);
             expect(createGoalResponse.status).toBe(201);
               const goalId = createGoalResponse.body._id;
           const response = await request
                .get(`/api/goals/${goalId}`)
                .set('Authorization', `Bearer ${token}`);
               expect(response.status).toBe(200);
              expect(response.body).toHaveProperty('_id', goalId);
             expect(response.body).toHaveProperty('name', goalData.name);
            expect(response.body).toHaveProperty('description', goalData.description);
              expect(response.body).toHaveProperty('targetValue', goalData.targetValue);
            expect(response.body).toHaveProperty('unit', goalData.unit);
            expect(response.body).toHaveProperty('startDate', new Date(goalData.startDate).toISOString());
            expect(response.body).toHaveProperty('endDate', new Date(goalData.endDate).toISOString());
        });


        it('should not get a goal with an invalid id format', async () => {
             const response = await request
                .get(`/api/goals/invalid-goal-id`)
               .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(400);
               expect(response.body).toHaveProperty('message', 'Invalid Goal ID');
         });



        it('should return 404 if goal is not found', async () => {
            const response = await request
                 .get(`/api/goals/6154e7c556c152001b000000`)
                .set('Authorization', `Bearer ${token}`);
           expect(response.status).toBe(404);
           expect(response.body).toHaveProperty('message', 'Goal not found');
         });
    });


     describe('Progress Tracking', () => {
         let token;
          let goalId;
         beforeEach(async () => {
           const userData = {
                 username: 'testuser',
                email: 'test@example.com',
                 password: 'TestPassword1!',
           };
             const signupResponse =  await request.post('/api/auth/signup').send(userData);
               expect(signupResponse.status).toBe(201);
            const loginData = {
                email: userData.email,
               password: userData.password,
            };
             const loginResponse = await request.post('/api/auth/login').send(loginData);
            expect(loginResponse.status).toBe(200);
            token = loginResponse.body.token;


            const goalData = {
                name: 'Run a marathon',
                description: 'Train to run a full marathon',
                 targetValue: 26.2,
                unit: 'miles',
                startDate: '2024-08-01',
                endDate: '2024-12-31',
            };
             const createGoalResponse = await request
                .post('/api/goals')
                 .set('Authorization', `Bearer ${token}`)
                 .send(goalData);
             expect(createGoalResponse.status).toBe(201);
              goalId = createGoalResponse.body._id;
        });

        it('should create a new progress entry', async () => {
            const progressData = {
                goalId: goalId,
                date: '2024-07-20',
                value: 100,
            };
            const response = await request
                .post('/api/progress')
                 .set('Authorization', `Bearer ${token}`)
                .send(progressData);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('goalId', progressData.goalId);
              expect(response.body).toHaveProperty('value', progressData.value);
            expect(response.body).toHaveProperty('date', new Date(progressData.date).toISOString());
            const progress = await Progress.findOne({goalId: progressData.goalId});
             expect(progress).toBeDefined();
            expect(progress?.value).toEqual(progressData.value);


        });

        it('should not create a new progress entry with invalid data', async () => {
               const invalidProgressData = {
                   goalId: 'invalid-goal-id',
                date: 'invalid',
                   value: -100,
            };
            const response = await request
                .post('/api/progress')
                 .set('Authorization', `Bearer ${token}`)
                .send(invalidProgressData);
             expect(response.status).toBe(400);
              expect(response.body).toHaveProperty('errors');
            expect(response.body.errors).toBeInstanceOf(Array);
            const progress = await Progress.findOne({goalId: invalidProgressData.goalId});
             expect(progress).toBeNull();

        });

         it('should get all progress entries for a specific goal', async () => {
           const progressData1 = {
                goalId: goalId,
                 date: '2024-07-20',
                value: 100,
            };
            const progressData2 = {
                goalId: goalId,
                date: '2024-07-21',
                value: 200,
            };
             await request
               .post('/api/progress')
               .set('Authorization', `Bearer ${token}`)
               .send(progressData1);
             await request
                .post('/api/progress')
                 .set('Authorization', `Bearer ${token}`)
                .send(progressData2);
           const response = await request
               .get(`/api/progress/${goalId}`)
               .set('Authorization', `Bearer ${token}`);
           expect(response.status).toBe(200);
           expect(response.body).toBeInstanceOf(Array);
             expect(response.body.length).toBe(2);
             const progress1 = await Progress.findOne({value: progressData1.value});
           expect(response.body.some((progress) => progress._id === progress1?._id.toString())).toBe(true);
            const progress2 = await Progress.findOne({value: progressData2.value});
            expect(response.body.some((progress) => progress._id === progress2?._id.toString())).toBe(true);

        });

          it('should return 400 for invalid goal id format while getting progress entries', async () => {
              const response = await request
                .get(`/api/progress/invalid-goal-id`)
               .set('Authorization', `Bearer ${token}`);
           expect(response.status).toBe(400);
               expect(response.body).toHaveProperty('message', 'Invalid Goal ID');
          });
    });
});