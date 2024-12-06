import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await apiLogin(username, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || '登录失败', isLoading: false });
    }
  },

  logout: () => {
    apiLogout();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    set({ user: { ...userData } });
  }
}));

export default useAuthStore;