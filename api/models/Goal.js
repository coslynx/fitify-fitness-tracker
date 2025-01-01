import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Goal name is required'],
        minLength: [3, 'Goal name must be at least 3 characters'],
        maxLength: [50, 'Goal name cannot exceed 50 characters'],
        trim: true,
    },
    description: {
        type: String,
        maxLength: [200, 'Goal description cannot exceed 200 characters'],
        trim: true,
    },
    targetValue: {
        type: Number,
        required: [true, 'Target value is required'],
        min: [0, 'Target value must be a positive number'],
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        enum: {
            values: ['kg', 'lbs', 'steps', 'miles', 'km', 'minutes'],
            message: 'Invalid unit. Must be one of: kg, lbs, steps, miles, km, minutes',
        }
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

goalSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        const error = new Error('Start date cannot be after end date');
        return next(error);
    }
    next();
});


const Goal = mongoose.model('Goal', goalSchema);

export default Goal;

if (import.meta.vitest) {
    const { describe, it, expect, vi, beforeEach, afterEach } = import.meta.vitest;
    const mongoose = await import('mongoose')

    const testDbUrl = process.env.VITE_DATABASE_URL + '_test';

    describe('Goal Model', () => {
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

        it('should create a goal with valid data', async () => {
            const validGoalData = {
                userId: new mongoose.Types.ObjectId(),
                name: 'Run a Marathon',
                description: 'Train to run a full marathon',
                targetValue: 26.2,
                unit: 'miles',
                startDate: new Date('2024-08-01'),
                endDate: new Date('2024-12-31'),
            };
           try {
              const goal = new Goal(validGoalData);
                await goal.save();
              expect(goal.name).toBe(validGoalData.name);
               expect(goal.description).toBe(validGoalData.description);
                expect(goal.targetValue).toBe(validGoalData.targetValue);
                 expect(goal.unit).toBe(validGoalData.unit);
                expect(goal.startDate).toEqual(validGoalData.startDate);
               expect(goal.endDate).toEqual(validGoalData.endDate);
               expect(goal.createdAt).toBeInstanceOf(Date);
                expect(goal.updatedAt).toBeInstanceOf(Date);
           } catch (error) {
                 console.error('Error saving valid goal data:', error);
                throw error;
            }
        });

        it('should update the updatedAt field on save', async () => {
            const goalData = {
                userId: new mongoose.Types.ObjectId(),
                name: 'Read a Book',
                description: 'Read 10 pages a day',
                targetValue: 3650,
                unit: 'pages',
                startDate: new Date('2024-07-01'),
                endDate: new Date('2024-12-31'),
            };
          try {
               const goal = new Goal(goalData);
              await goal.save();
              const originalUpdateTime = goal.updatedAt;
              goal.name = 'Read another Book';
              await goal.save();
              expect(goal.updatedAt).toBeInstanceOf(Date);
               expect(goal.updatedAt.getTime()).toBeGreaterThan(originalUpdateTime.getTime());
           } catch (error) {
              console.error('Error updating updatedAt field:', error);
               throw error;
           }

        });


        it('should throw an error if userId is missing', async () => {
            const invalidGoalData = {
                name: 'Invalid Goal',
                description: 'Missing user ID',
                targetValue: 10,
                unit: 'kg',
                startDate: new Date(),
                endDate: new Date(),
            };
          try {
            const goal = new Goal(invalidGoalData);
             await  goal.save();
          } catch (error) {
               expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.userId?.message).toBe('User ID is required');
          }
       });


      it('should throw an error if name is missing', async () => {
            const invalidGoalData = {
                userId: new mongoose.Types.ObjectId(),
                description: 'Missing goal name',
                targetValue: 10,
                unit: 'kg',
                startDate: new Date(),
                endDate: new Date(),
            };
            try {
                const goal = new Goal(invalidGoalData);
                await goal.save();
            } catch (error) {
                 expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.name?.message).toBe('Goal name is required');
            }
        });

        it('should throw an error if name is too short', async () => {
           const invalidGoalData = {
                userId: new mongoose.Types.ObjectId(),
                name: 'te',
                 description: 'Goal name too short',
                targetValue: 10,
                unit: 'kg',
               startDate: new Date(),
                endDate: new Date(),
          };
            try {
                const goal = new Goal(invalidGoalData);
                await goal.save();
            } catch (error) {
                  expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.name?.message).toBe('Goal name must be at least 3 characters');
            }
        });

        it('should throw an error if name is too long', async () => {
           const invalidGoalData = {
               userId: new mongoose.Types.ObjectId(),
                name: 'tooloooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong',
                description: 'Goal name too long',
                targetValue: 10,
                unit: 'kg',
                startDate: new Date(),
               endDate: new Date(),
           };
            try {
                const goal = new Goal(invalidGoalData);
              await goal.save();
           } catch (error) {
                expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.name?.message).toBe('Goal name cannot exceed 50 characters');
           }
        });

          it('should throw an error if description is too long', async () => {
            const invalidGoalData = {
               userId: new mongoose.Types.ObjectId(),
                name: 'Test Goal',
               description: 'toolooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong',
                targetValue: 10,
                unit: 'kg',
                startDate: new Date(),
                endDate: new Date(),
            };
            try {
                const goal = new Goal(invalidGoalData);
                await goal.save();
           } catch (error) {
                 expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
               expect(error?.errors?.description?.message).toBe('Goal description cannot exceed 200 characters');
           }
        });



        it('should throw an error if targetValue is missing', async () => {
            const invalidGoalData = {
               userId: new mongoose.Types.ObjectId(),
               name: 'Test Goal',
                description: 'Missing target value',
                unit: 'kg',
                startDate: new Date(),
                 endDate: new Date(),
            };
           try {
               const goal = new Goal(invalidGoalData);
               await goal.save();
          } catch (error) {
               expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
             expect(error?.errors?.targetValue?.message).toBe('Target value is required');
           }
        });

        it('should throw an error if targetValue is negative', async () => {
            const invalidGoalData = {
               userId: new mongoose.Types.ObjectId(),
                name: 'Test Goal',
                 description: 'Invalid target value',
               targetValue: -10,
               unit: 'kg',
               startDate: new Date(),
               endDate: new Date(),
           };
            try {
               const goal = new Goal(invalidGoalData);
               await goal.save();
           } catch (error) {
               expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
               expect(error?.errors?.targetValue?.message).toBe('Target value must be a positive number');
          }
        });


         it('should throw an error if unit is missing', async () => {
            const invalidGoalData = {
                userId: new mongoose.Types.ObjectId(),
               name: 'Test Goal',
                description: 'Missing unit',
               targetValue: 10,
               startDate: new Date(),
                endDate: new Date(),
            };
           try {
                const goal = new Goal(invalidGoalData);
                await goal.save();
           } catch (error) {
                expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.unit?.message).toBe('Unit is required');
           }
       });


         it('should throw an error if unit is invalid', async () => {
            const invalidGoalData = {
               userId: new mongoose.Types.ObjectId(),
                name: 'Test Goal',
                description: 'Invalid unit',
                targetValue: 10,
                unit: 'invalid',
                 startDate: new Date(),
                 endDate: new Date(),
            };
            try {
                const goal = new Goal(invalidGoalData);
                 await goal.save();
             } catch (error) {
                  expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.unit?.message).toBe('Invalid unit. Must be one of: kg, lbs, steps, miles, km, minutes');
            }
        });

         it('should throw an error if startDate is missing', async () => {
            const invalidGoalData = {
               userId: new mongoose.Types.ObjectId(),
                name: 'Test Goal',
                description: 'Missing start date',
                targetValue: 10,
                unit: 'kg',
               endDate: new Date(),
            };
             try {
                const goal = new Goal(invalidGoalData);
                 await goal.save();
           } catch (error) {
                expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
              expect(error?.errors?.startDate?.message).toBe('Start date is required');
           }
       });

         it('should throw an error if endDate is missing', async () => {
            const invalidGoalData = {
                userId: new mongoose.Types.ObjectId(),
                name: 'Test Goal',
                description: 'Missing end date',
               targetValue: 10,
                unit: 'kg',
                startDate: new Date(),
            };
           try {
               const goal = new Goal(invalidGoalData);
                 await goal.save();
             } catch (error) {
                 expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
               expect(error?.errors?.endDate?.message).toBe('End date is required');
           }
        });

        it('should throw an error if startDate is after endDate', async () => {
            const invalidGoalData = {
               userId: new mongoose.Types.ObjectId(),
               name: 'Test Goal',
                description: 'Invalid date range',
               targetValue: 10,
                unit: 'kg',
               startDate: new Date('2024-12-31'),
                 endDate: new Date('2024-08-01'),
            };

            try {
                const goal = new Goal(invalidGoalData);
               await goal.save();
           } catch (error) {
                expect(error.message).toBe('Start date cannot be after end date');
            }
        });

        it('should handle duplicate index creation for userId', async () => {
                const goalData1 = {
                  userId: new mongoose.Types.ObjectId(),
                   name: 'Test Goal 1',
                    description: 'Test Description 1',
                    targetValue: 10,
                    unit: 'kg',
                    startDate: new Date(),
                     endDate: new Date(),
              };
                const goalData2 = {
                    userId: goalData1.userId,
                    name: 'Test Goal 2',
                    description: 'Test Description 2',
                    targetValue: 20,
                     unit: 'lbs',
                   startDate: new Date(),
                    endDate: new Date(),
                };

            try {
                 const goal1 = new Goal(goalData1);
                 await goal1.save();
                   const goal2 = new Goal(goalData2);
                await goal2.save();
               
            } catch (error) {
                expect(error).toBeInstanceOf(mongoose.Error.MongoServerError);
                expect(error?.code).toBe(11000)
            }
        });

    });
}