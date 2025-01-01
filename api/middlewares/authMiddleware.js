import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';

dotenv.config();

const VITE_JWT_SECRET = process.env.VITE_JWT_SECRET;

if (!VITE_JWT_SECRET) {
    throw new Error('VITE_JWT_SECRET is not defined in the environment variables.');
}

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
    } else {
         return res.status(401).json({ message: 'Unauthorized' });
    }


    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, VITE_JWT_SECRET);
        req.user = decoded;
         if (!req.user) {
              return res.status(401).json({ message: 'Unauthorized' });
        }
          next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        res.status(401).json({ message: 'Unauthorized' });
    }
});

export default authMiddleware;


if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;
  const authMiddleware = (await import('./authMiddleware.js')).default;
  const jwt = await import('jsonwebtoken')
  const dotenv = await import('dotenv');


  describe('authMiddleware', () => {
    const mockRequest = (token, headers = {}) => {
      const req = {
        headers: {
           ...headers,
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      };
      return req;
    };


    const mockResponse = () => {
      const res = {};
       res.status = vi.fn().mockReturnValue(res);
      res.json = vi.fn().mockReturnValue(res);
      return res;
    };


    const mockNext = vi.fn();

    it('should verify a valid token and attach user data to the request', async () => {
        const mockSecret = 'test-secret-key';
      vi.spyOn(dotenv, 'config').mockReturnValue({});
      vi.stubEnv('VITE_JWT_SECRET', mockSecret);

      const mockToken = jwt.sign({ sub: '123', email: 'test@example.com', name: 'Test User' }, mockSecret);
       const req = mockRequest(mockToken);
      const res = mockResponse();

      await authMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
       expect(res.status).not.toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.sub).toBe('123');
        expect(req.user.email).toBe('test@example.com');
         expect(req.user.name).toBe('Test User');
    });

    it('should return 401 status if token is missing', async () => {
        vi.spyOn(dotenv, 'config').mockReturnValue({});
        vi.stubEnv('VITE_JWT_SECRET', 'test-secret-key');
         const req = mockRequest(null);
      const res = mockResponse();

       await authMiddleware(req, res, mockNext);


      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
       expect(req.user).toBeUndefined();

    });

    it('should return 401 status if token is invalid', async () => {
           vi.spyOn(dotenv, 'config').mockReturnValue({});
        vi.stubEnv('VITE_JWT_SECRET', 'test-secret-key');
      const invalidToken = 'invalid-token';
      const req = mockRequest(invalidToken);
      const res = mockResponse();

       await authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
         expect(req.user).toBeUndefined();
    });

    it('should return 401 status if token is expired', async () => {
         const mockSecret = 'test-secret-key';
           vi.spyOn(dotenv, 'config').mockReturnValue({});
        vi.stubEnv('VITE_JWT_SECRET', mockSecret);

       const expiredToken = jwt.sign({ sub: '123', exp: Math.floor(Date.now() / 1000) - (60 * 60) }, mockSecret);
      const req = mockRequest(expiredToken);
      const res = mockResponse();

       await authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        expect(mockNext).not.toHaveBeenCalled();
         expect(req.user).toBeUndefined();
    });


    it('should return 401 status if token does not start with Bearer', async () => {
           vi.spyOn(dotenv, 'config').mockReturnValue({});
        vi.stubEnv('VITE_JWT_SECRET', 'test-secret-key');
      const invalidToken = 'invalid-token';
      const req = mockRequest(invalidToken, {authorization: `Invalid ${invalidToken}`});
      const res = mockResponse();


       await authMiddleware(req, res, mockNext);


        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        expect(mockNext).not.toHaveBeenCalled();
         expect(req.user).toBeUndefined();
   });

      it('should return 401 status if user is not set', async () => {
       const mockSecret = 'test-secret-key';
        vi.spyOn(dotenv, 'config').mockReturnValue({});
        vi.stubEnv('VITE_JWT_SECRET', mockSecret);

      const mockToken = jwt.sign({  }, mockSecret);
      const req = mockRequest(mockToken);
      const res = mockResponse();

      await authMiddleware(req, res, mockNext);
          expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        expect(mockNext).not.toHaveBeenCalled();
         expect(req.user).toBeUndefined();
     });
  });
}