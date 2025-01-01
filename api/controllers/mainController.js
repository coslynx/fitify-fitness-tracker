import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import Progress from '../models/Progress.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Route 1: POST /api/auth/signup - Create a new user
router.post(
    '/auth/signup',
    [
        body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3, max: 25 }).withMessage('Username must be between 3 and 25 characters'),
        body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').normalizeEmail(),
        body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    async (req, res) => {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { username, email, password } = req.body;

        try {
             // Connect to the database
            await connectDB();

            // Check for duplicate username or email
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
             if (existingUser) {
               if (existingUser.username === username) {
                  return res.status(409).json({ message: 'Username already exists' });
                }
               if (existingUser.email === email) {
                  return res.status(409).json({ message: 'Email already exists' });
                }
            }
           
            // Create new user
            const newUser = new User({ username, email, password });
            await newUser.save();
            
            // Return new user (excluding password)
            const user = newUser.toObject();
            delete user.password;


            res.status(201).json(user);
        } catch (error) {
            console.error('Error creating user:', error);
             if (error.code === 11000) {
                    return res.status(409).json({ message: 'Username or email already exists' });
                }
            res.status(500).json({ message: 'Failed to create user', error: error.message });
        }
    }
);

// Route 2: POST /api/auth/login - Login an existing user
router.post(
    '/auth/login',
    [
        body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').normalizeEmail(),
        body('password').trim().notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
         // Validate inputs
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
             return res.status(400).json({ errors: errors.array() });
         }
        const { email, password } = req.body;
        try {
            // Connect to the database
           await connectDB();

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const jwtSecret = process.env.VITE_JWT_SECRET;
             if (!jwtSecret) {
                  console.error("VITE_JWT_SECRET is not defined in the environment variables.");
                  return res.status(500).json({ message: 'JWT secret is missing' });
              }
            const token = jwt.sign({ sub: user._id, email: user.email, name: user.username }, jwtSecret, { expiresIn: '1h' });

            // Return token
            res.status(200).json({ token });
        } catch (error) {
             console.error('Error logging in user:', error);
            res.status(500).json({ message: 'Failed to login', error: error.message });
        }
    }
);

// Route 3: GET /api/users/me - Get the current user's profile
router.get('/users/me', authMiddleware, async (req, res) => {
    try {
          // Connect to the database
         await connectDB();
        // Get user data using user ID from token
        const user = await User.findById(req.user.sub);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

         // Return user (excluding password)
         const userProfile = user.toObject();
         delete userProfile.password;


        res.status(200).json(userProfile);
    } catch (error) {
         console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
    }
});

// Route 4: POST /api/goals - Create a new goal
router.post(
    '/goals',
    authMiddleware,
    [
        body('name').trim().notEmpty().withMessage('Goal name is required').isLength({ min: 3, max: 50 }).withMessage('Goal name must be between 3 and 50 characters'),
        body('description').trim().isLength({ max: 200 }).withMessage('Goal description cannot exceed 200 characters'),
         body('targetValue').notEmpty().withMessage('Target value is required').isNumeric().withMessage('Target value must be a number').isFloat({ min: 0 }).withMessage('Target value must be a positive number'),
        body('unit').trim().notEmpty().withMessage('Unit is required').isIn(['kg', 'lbs', 'steps', 'miles', 'km', 'minutes']).withMessage('Invalid unit'),
        body('startDate').trim().notEmpty().withMessage('Start date is required').isISO8601().toDate().withMessage('Invalid start date format'),
        body('endDate').trim().notEmpty().withMessage('End date is required').isISO8601().toDate().withMessage('Invalid end date format'),
    ],
    async (req, res) => {
          // Validate inputs
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
             return res.status(400).json({ errors: errors.array() });
         }
        const { name, description, targetValue, unit, startDate, endDate } = req.body;
        try {
           // Connect to the database
             await connectDB();
            // Create new goal
            const newGoal = new Goal({
                userId: req.user.sub,
                name,
                description,
                targetValue,
                unit,
                startDate,
                endDate,
            });
             await newGoal.save();

            // Return created goal
            res.status(201).json(newGoal);
        } catch (error) {
             console.error('Error creating goal:', error);
             res.status(500).json({ message: 'Failed to create goal', error: error.message });
        }
    }
);


// Route 5: GET /api/goals - Get all goals for the current user
router.get('/goals', authMiddleware, async (req, res) => {
    try {
        // Connect to the database
       await connectDB();

        // Retrieve all goals for the current user using their ID
        const goals = await Goal.find({ userId: req.user.sub });

        res.status(200).json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ message: 'Failed to fetch goals', error: error.message });
    }
});

// Route 6: GET /api/goals/:goalId - Get a single goal by id
router.get('/goals/:goalId', authMiddleware, async (req, res) => {
     try {
          // Connect to the database
            await connectDB();
            const { goalId } = req.params;
            if(!goalId || goalId === undefined) {
                 return res.status(400).json({ message: 'Goal ID is required' });
            }
            // Find goal by ID and ensure it belongs to the authenticated user
            const goal = await Goal.findOne({ _id: goalId, userId: req.user.sub });
            if (!goal) {
                 return res.status(404).json({ message: 'Goal not found' });
            }
            res.status(200).json(goal);
     } catch (error) {
        console.error('Error fetching goal:', error);
         if(error.name === 'CastError') {
                return res.status(400).json({message: 'Invalid Goal ID'});
            }
           res.status(500).json({ message: 'Failed to fetch goal', error: error.message });
     }
 });


// Route 7: POST /api/progress - Create a new progress entry
router.post(
    '/progress',
    authMiddleware,
     [
        body('goalId').trim().notEmpty().withMessage('Goal ID is required').isMongoId().withMessage('Invalid goal ID format'),
        body('date').trim().notEmpty().withMessage('Date is required').isISO8601().toDate().withMessage('Invalid date format'),
        body('value').trim().notEmpty().withMessage('Progress value is required').isNumeric().withMessage('Progress value must be a number').isFloat({ min: 0 }).withMessage('Progress value must be a positive number'),
    ],
    async (req, res) => {
          // Validate inputs
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
             return res.status(400).json({ errors: errors.array() });
         }
        const { goalId, date, value } = req.body;
        try {
           // Connect to the database
           await connectDB();
            // Create new progress entry
            const newProgress = new Progress({
                userId: req.user.sub,
                goalId,
                date,
                value,
            });
            await newProgress.save();

            // Return created progress entry
            res.status(201).json(newProgress);
        } catch (error) {
             console.error('Error creating progress entry:', error);
             res.status(500).json({ message: 'Failed to add progress', error: error.message });
        }
    }
);


// Route 8: GET /api/progress/:goalId - Get all progress entries for a specific goal
router.get('/progress/:goalId', authMiddleware, async (req, res) => {
    try {
       // Connect to the database
          await connectDB();
         const { goalId } = req.params;
           if(!goalId || goalId === undefined) {
                return res.status(400).json({ message: 'Goal ID is required' });
           }
           // Retrieve all progress entries for the current user's goal
        const progress = await Progress.find({ userId: req.user.sub, goalId: goalId });
        res.status(200).json(progress);
    } catch (error) {
         console.error('Error fetching progress entries:', error);
          if(error.name === 'CastError') {
               return res.status(400).json({message: 'Invalid Goal ID'});
          }
         res.status(500).json({ message: 'Failed to fetch progress', error: error.message });
    }
});

export default router;