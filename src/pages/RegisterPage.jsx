import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = '请输入用户名';
    else if (form.username.length < 3) errs.username = '用户名至少 3 个字符';
    if (!form.email.trim()) errs.email = '请输入邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = '邮箱格式不正确';
    if (!form.password) errs.password = '请输入密码';
    else if (form.password.length < 6) errs.password = '密码至少 6 位';
    if (form.password !== form.confirmPassword) errs.confirmPassword = '两次密码不一致';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = registerUser({
      username: form.username,
      email: form.email,
      password: form.password,
      nickname: form.nickname || form.username,
    });
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setErrors({ form: result.error });
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1>创建账户</h1>
        <p className={styles.subtitle}>加入 Atelier Shop，开启品质生活</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-username">用户名</label>
            <input
              id="reg-username"
              name="username"
              type="text"
              autoComplete="username"
              spellCheck={false}
              placeholder="至少 3 个字符…"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            {errors.username && <p className="form-error" role="alert">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">邮箱</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="your@email.com…"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="form-error" role="alert">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-nickname">昵称（可选）</label>
            <input
              id="reg-nickname"
              name="nickname"
              type="text"
              autoComplete="nickname"
              placeholder="你的昵称…"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">密码</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="至少 6 位…"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="form-error" role="alert">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">确认密码</label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="再次输入密码…"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {errors.confirmPassword && <p className="form-error" role="alert">{errors.confirmPassword}</p>}
          </div>

          {errors.form && <p className="form-error" role="alert">{errors.form}</p>}

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? '注册中…' : '注册'}
          </button>
        </form>

        <p className={styles.switchLink}>
          已有账户？<Link to="/login">立即登录</Link>
        </p>
      </div>
    </div>
  );
}
