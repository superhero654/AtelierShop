import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const AuthContext = createContext(null);

const USER_SESSION_KEY = 'currentUser';
const ADMIN_SESSION_KEY = 'currentAdmin';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    loadFromStorage(USER_SESSION_KEY, null)
  );
  const [admin, setAdmin] = useState(() =>
    loadFromStorage(ADMIN_SESSION_KEY, null)
  );

  useEffect(() => {
    if (user) {
      saveToStorage(USER_SESSION_KEY, user);
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (admin) {
      saveToStorage(ADMIN_SESSION_KEY, admin);
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }, [admin]);

  const loginUser = useCallback(async (username, password) => {
    try {
      const result = await authService.loginUser(username, password);
      setUser(result);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || '用户名或密码错误' };
    }
  }, []);

  const registerUser = useCallback(async (data) => {
    try {
      const result = await authService.registerUser(data);
      setUser(result);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || '注册失败' };
    }
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
  }, []);

  const updateUserProfile = useCallback(async (data) => {
    if (!user) return;
    try {
      const updated = await authService.updateUser(user.id, data);
      const { password, ...safe } = updated;
      setUser(safe);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user]);

  const loginAdmin = useCallback(async (username, password) => {
    try {
      const result = await authService.loginAdmin(username, password);
      setAdmin(result);
      return { success: true, admin: result };
    } catch (err) {
      return { success: false, error: err.message || '管理员账号或密码错误' };
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdmin(null);
  }, []);

  const value = {
    user,
    admin,
    isLoggedIn: !!user,
    isAdminLoggedIn: !!admin,
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    loginAdmin,
    logoutAdmin,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
