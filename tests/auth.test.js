const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { UserModel } = require('../models/User');

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      header: jest.fn()
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should authenticate valid token', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test_secret');
    
    mockReq.header.mockReturnValue(`Bearer ${token}`);
    
    // Mock user find
    UserModel.findById = jest.fn().mockResolvedValue({
      _id: userId,
      username: 'testuser',
      email: 'test@example.com'
    });

    await auth(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
  });

  it('should reject request without token', async () => {
    mockReq.header.mockReturnValue(null);

    await auth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied. No token provided.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    mockReq.header.mockReturnValue('Bearer invalid_token');

    await auth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});