import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minLength: [3, 'Username must be at least 3 characters'],
        maxLength: [25, 'Username cannot exceed 25 characters'],
        index: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Please provide a valid email address'],
        lowercase: true,
        index: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 characters'],
        trim: true,
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

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this.updatedAt = Date.now();
      next();
    } catch (error) {
      console.error('Error hashing password:', error);
      next(error);
    }
  });

userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Password comparison failed', { cause: error });
  }
};

const User = mongoose.model('User', userSchema);

export default User;


if (import.meta.vitest) {
    const { describe, it, expect, vi, afterEach } = import.meta.vitest;
    const mongoose = await import('mongoose')
   
    const testDbUrl = process.env.VITE_DATABASE_URL + '_test';
   
   
    describe('User Model', () => {
         beforeEach(async () => {
            await mongoose.connect(testDbUrl, {
              useNewUrlParser: true,
              useUnifiedTopology: true
              });
         });
      afterEach(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
      });

      it('should hash the password before saving', async () => {
          const userData = {
              username: 'testuser',
              email: 'test@example.com',
              password: 'TestPassword1!',
          };
           const user = new User(userData);
           await user.save();
          expect(user.password).not.toBe(userData.password);
          expect(user.password).toMatch(/^\$2[aby]\$.{56}$/);
        });

        it('should not hash the password if it has not been modified', async () => {
              const userData = {
                  username: 'testuser2',
                  email: 'test2@example.com',
                  password: 'TestPassword1!',
              };
              const user = new User(userData);
            await user.save();
            const originalHashedPassword = user.password;
             user.username = 'testuser2Updated';
            await user.save();
           expect(user.password).toEqual(originalHashedPassword);
        });
    
        it('should compare the password correctly', async () => {
              const userData = {
                  username: 'testuser3',
                  email: 'test3@example.com',
                  password: 'TestPassword1!',
              };
              const user = new User(userData);
            await user.save();
            const isMatch = await user.comparePassword('TestPassword1!');
              expect(isMatch).toBe(true);
               const isNotMatch = await user.comparePassword('TestPassword1');
              expect(isNotMatch).toBe(false);
        });

        it('should throw an error if the email is invalid', async () => {
            const userData = {
                username: 'testuser4',
                email: 'invalid-email',
                password: 'TestPassword1!',
            };
            const user = new User(userData);
            let error;
            try {
               await user.save();
             } catch (e) {
                error = e;
             }
           expect(error).toBeInstanceOf(mongoose.Error.ValidationError)
          expect(error?.errors?.email?.message).toBe('Please provide a valid email address');
        });

      it('should throw an error if the username is less than 3 characters', async () => {
            const userData = {
                username: 'te',
                email: 'test4@example.com',
                password: 'TestPassword1!',
            };
          const user = new User(userData);
           let error;
            try {
                await user.save();
            } catch (e) {
                error = e;
            }
           expect(error).toBeInstanceOf(mongoose.Error.ValidationError)
           expect(error?.errors?.username?.message).toBe('Username must be at least 3 characters');
        });

        it('should throw an error if the username exceeds 25 characters', async () => {
            const userData = {
                username: 'testuser123456789012345678901234',
                email: 'test5@example.com',
                password: 'TestPassword1!',
            };
          const user = new User(userData);
            let error;
            try {
                await user.save();
            } catch (e) {
                error = e;
            }
             expect(error).toBeInstanceOf(mongoose.Error.ValidationError)
            expect(error?.errors?.username?.message).toBe('Username cannot exceed 25 characters');
        });

       it('should throw an error if the password is less than 8 characters', async () => {
         const userData = {
              username: 'testuser6',
              email: 'test6@example.com',
                password: 'Test1!',
         };
           const user = new User(userData);
          let error;
           try {
              await user.save();
          } catch (e) {
                error = e;
           }
         expect(error).toBeInstanceOf(mongoose.Error.ValidationError)
        expect(error?.errors?.password?.message).toBe('Password must be at least 8 characters');
       });

        it('should handle duplicate usernames', async () => {
              const userData1 = {
                 username: 'testuser7',
                 email: 'test7@example.com',
                  password: 'TestPassword1!',
              };
              const userData2 = {
                  username: 'testuser7',
                  email: 'test8@example.com',
                   password: 'TestPassword2!',
               };
              const user1 = new User(userData1);
            await user1.save();
            const user2 = new User(userData2);
              let error;
            try {
                await user2.save();
            } catch (e) {
               error = e;
            }
            expect(error).toBeInstanceOf(mongoose.Error.MongoServerError)
              expect(error?.code).toBe(11000)
        });

         it('should handle duplicate emails', async () => {
               const userData1 = {
                   username: 'testuser9',
                  email: 'test9@example.com',
                   password: 'TestPassword1!',
                };
            const userData2 = {
                   username: 'testuser10',
                   email: 'test9@example.com',
                  password: 'TestPassword2!',
              };
              const user1 = new User(userData1);
             await user1.save();
               const user2 = new User(userData2);
           let error;
              try {
                  await user2.save();
               } catch (e) {
                  error = e;
              }
            expect(error).toBeInstanceOf(mongoose.Error.MongoServerError)
            expect(error?.code).toBe(11000)
        });
    });
}