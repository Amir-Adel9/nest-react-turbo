import { create } from 'zustand';
import type { UserEntity } from '@/api/types';

interface AuthState {
  user: UserEntity | null;
  setUser: (user: UserEntity | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
