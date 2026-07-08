import { create } from 'zustand';
import { IUser } from '@sk-careerhub/types';

interface AuthState {
  user: IUser | null;
  token: string | null;
  theme: 'light' | 'dark';
  setAuth: (user: IUser, token: string) => void;
  updateUser: (user: IUser) => void;
  clearAuth: () => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  theme: 'dark', // default to premium dark mode

  setAuth: (user, token) => set({ user, token }),
  
  updateUser: (user) => set({ user }),
  
  clearAuth: () => set({ user: null, token: null }),
  
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    
    // Apply class to documentElement
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    set({ theme: nextTheme });
  },

  initTheme: () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const finalTheme = savedTheme || systemTheme;
    
    localStorage.setItem('theme', finalTheme);
    if (finalTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    set({ theme: finalTheme });
  }
}));
