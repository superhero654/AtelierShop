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

  const loginUser = useCallback((username, password) => {
    const result = authService.loginUser(username, password);
    if (result) {
      setUser(result);
      return { success: true };
    }
    return { success: false, error: '用户名或密码错误' };
  }, []);

  const registerUser = useCallback((data) => {
    const result = authService.registerUser(data);
    if (result.error) {
      return { success: false, error: result.error };
    }
    setUser(result);
    return { success: true };
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
  }, []);

  const updateUserProfile = useCallback((data) => {
    if (!user) return;
    const updated = authService.updateUser(user.id, data);
    if (updated) {
      const { password, ...safe } = updated;
      setUser(safe);
    }
  }, [user]);

  const loginAdmin = useCallback((username, password) => {
    const result = authService.loginAdmin(username, password);
    if (result) {
      setAdmin(result);
      return { success: true, admin: result };
    }
    return { success: false, error: '管理员账号或密码错误' };
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
