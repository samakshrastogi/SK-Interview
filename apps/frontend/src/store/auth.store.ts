import { create } from 'zustand';
import { IUser } from '@sk-careerhub/types';

interface AuthState {
  user: IUser | null;
  token: string | null;
  theme: 'light';
  setAuth: (user: IUser, token: string) => void;
  updateUser: (user: IUser) => void;
  clearAuth: () => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  theme: 'light', // strictly light theme

  setAuth: (user, token) => set({ user, token }),
  
  updateUser: (user) => set({ user }),
  
  clearAuth: () => set({ user: null, token: null }),
  
  toggleTheme: () => {
    // Light theme only, do nothing
  },

  initTheme: () => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    set({ theme: 'light' });
  }
}));
