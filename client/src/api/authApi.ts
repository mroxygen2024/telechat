
import type { User } from '@/types';
import { requestJson } from '@/api/http';

type LoginResponse = {
  user: {
    _id: string;
    username: string;
  };
  token: string;
};

const normalizeUser = (user: LoginResponse['user']): User => ({
  id: user._id,
  username: user.username,
});

export const authApi = {
  login: async (username: string, password: string): Promise<{ user: User, token: string }> => {
    const response = await requestJson<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
      false
    );

    return {
      user: normalizeUser(response.user),
      token: response.token,
    };
  },
  signup: async (username: string, password: string): Promise<{ user: User, token: string }> => {
    const response = await requestJson<LoginResponse>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
      false
    );

    return {
      user: normalizeUser(response.user),
      token: response.token,
    };
  }
};
