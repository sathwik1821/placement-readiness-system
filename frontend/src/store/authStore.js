import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  user: null,
  login: (token, role, user = null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    set({ token, role, user });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    set({ token: null, role: null, user: null });
  }
}));
