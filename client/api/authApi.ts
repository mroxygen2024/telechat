
import { User } from '../types';
import { DUMMY_ME } from '../constants';

export const authApi = {
  login: async (username: string, password: string): Promise<{ user: User, token: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (username === 'admin' && password === 'password') {
      return {
        user: DUMMY_ME,
        token: 'mock-jwt-token-123456789'
      };
    }
    throw new Error('Invalid credentials. Use admin/password');
  }
};
