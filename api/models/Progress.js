import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        index: true,
    },
    goalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Goal ID is required'],
        ref: 'Goal',
        index: true,
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    value: {
        type: Number,
        required: [true, 'Progress value is required'],
        min: [0, 'Progress value must be a positive number'],
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


progressSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});


const Progress = mongoose.model('Progress', progressSchema);

export default Progress;


if (import.meta.vitest) {
    const { describe, it, expect, beforeEach, afterEach } = import.meta.vitest;
    const mongoose = await import('mongoose');

    const testDbUrl = process.env.VITE_DATABASE_URL + '_test';

    describe('Progress Model', () => {
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


        it('should create a progress entry with valid data', async () => {
            const validProgressData = {
                userId: new mongoose.Types.ObjectId(),
                goalId: new mongoose.Types.ObjectId(),
                date: new Date(),
                value: 100,
            };
            try {
                const progress = new Progress(validProgressData);
                await progress.save();
                expect(progress.userId).toBe(validProgressData.userId);
                expect(progress.goalId).toBe(validProgressData.goalId);
                expect(progress.date).toEqual(validProgressData.date);
                expect(progress.value).toBe(validProgressData.value);
                expect(progress.createdAt).toBeInstanceOf(Date);
                expect(progress.updatedAt).toBeInstanceOf(Date);
            } catch (error) {
                console.error('Error saving valid progress data:', error);
                throw error;
            }
        });


        it('should update the updatedAt field on save', async () => {
           const progressData = {
               userId: new mongoose.Types.ObjectId(),
                goalId: new mongoose.Types.ObjectId(),
                date: new Date(),
                value: 100,
            };
            try {
                const progress = new Progress(progressData);
                await progress.save();
                const originalUpdateTime = progress.updatedAt;
                progress.value = 120;
                await progress.save();
                expect(progress.updatedAt).toBeInstanceOf(Date);
                expect(progress.updatedAt.getTime()).toBeGreaterThan(originalUpdateTime.getTime());
            } catch (error) {
                console.error('Error updating updatedAt field:', error);
                throw error;
            }
        });


        it('should throw an error if userId is missing', async () => {
            const invalidProgressData = {
                goalId: new mongoose.Types.ObjectId(),
                date: new Date(),
                value: 100,
            };
            try {
                const progress = new Progress(invalidProgressData);
                await progress.save();
            } catch (error) {
                 expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.userId?.message).toBe('User ID is required');
            }
        });

        it('should throw an error if goalId is missing', async () => {
            const invalidProgressData = {
                userId: new mongoose.Types.ObjectId(),
                date: new Date(),
                value: 100,
            };
            try {
                const progress = new Progress(invalidProgressData);
                await progress.save();
            } catch (error) {
                expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                 expect(error?.errors?.goalId?.message).toBe('Goal ID is required');
            }
        });

        it('should throw an error if date is missing', async () => {
            const invalidProgressData = {
                userId: new mongoose.Types.ObjectId(),
                goalId: new mongoose.Types.ObjectId(),
                value: 100,
            };
            try {
                const progress = new Progress(invalidProgressData);
                await progress.save();
            } catch (error) {
                 expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.date?.message).toBe('Date is required');
            }
        });


        it('should throw an error if value is missing', async () => {
            const invalidProgressData = {
                userId: new mongoose.Types.ObjectId(),
                goalId: new mongoose.Types.ObjectId(),
                date: new Date(),
            };
            try {
                const progress = new Progress(invalidProgressData);
                await progress.save();
           } catch (error) {
                expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.value?.message).toBe('Progress value is required');
            }
        });

        it('should throw an error if value is negative', async () => {
            const invalidProgressData = {
                userId: new mongoose.Types.ObjectId(),
                goalId: new mongoose.Types.ObjectId(),
                date: new Date(),
                value: -100,
            };
           try {
               const progress = new Progress(invalidProgressData);
                await progress.save();
           } catch (error) {
                expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error?.errors?.value?.message).toBe('Progress value must be a positive number');
            }
        });


         it('should handle duplicate index creation for userId and goalId', async () => {
             const userId = new mongoose.Types.ObjectId();
              const goalId = new mongoose.Types.ObjectId();
            const progressData1 = {
                userId: userId,
                goalId: goalId,
                date: new Date(),
                value: 100,
            };
            const progressData2 = {
                userId: userId,
                goalId: goalId,
                date: new Date(),
                value: 120,
            };

            try {
                const progress1 = new Progress(progressData1);
                 await progress1.save();
                 const progress2 = new Progress(progressData2);
                  await progress2.save();

            } catch (error) {
                expect(error).toBeInstanceOf(mongoose.Error.MongoServerError);
               expect(error?.code).toBe(11000)
           }
        });
    });
}