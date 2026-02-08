
import { create } from 'zustand';
import { User, AuthState } from '../types';

interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
  setSessionExpired: (message?: string) => void;
  clearAuthError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  authError: null,

  login: (user, token) => {
    localStorage.setItem('telechat_token', token);
    localStorage.setItem('telechat_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, authError: null });
  },

  logout: () => {
    localStorage.removeItem('telechat_token');
    localStorage.removeItem('telechat_user');
    set({ user: null, token: null, isAuthenticated: false, authError: null });
  },

  setSessionExpired: (message = 'Session expired, please login again') => {
    localStorage.removeItem('telechat_token');
    localStorage.removeItem('telechat_user');
    set({ user: null, token: null, isAuthenticated: false, authError: message });
  },

  clearAuthError: () => set({ authError: null }),

  checkAuth: () => {
    const token = localStorage.getItem('telechat_token');
    const userJson = localStorage.getItem('telechat_user');
    if (token && userJson) {
      set({ token, user: JSON.parse(userJson), isAuthenticated: true });
    }
  },
}));
