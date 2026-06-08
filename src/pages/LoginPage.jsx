import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = '请输入用户名或邮箱';
    if (!form.password) errs.password = '请输入密码';
    else if (form.password.length < 6) errs.password = '密码至少 6 位';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await loginUser(form.username, form.password);
    setLoading(false);
    if (result.success) {
      navigate(decodeURIComponent(redirect));
    } else {
      setErrors({ form: result.error });
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1>欢迎回来</h1>
        <p className={styles.subtitle}>登录你的 Atelier Shop 账户</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-username">用户名 / 邮箱</label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="demo 或 demo@shop.com…"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            {errors.username && <p className="form-error" role="alert">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">密码</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入密码…"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="form-error" role="alert">{errors.password}</p>}
          </div>

          {errors.form && <p className="form-error" role="alert">{errors.form}</p>}

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? '登录中…' : '登录'}
          </button>
        </form>

        <p className={styles.switchLink}>
          还没有账户？<Link to="/register">立即注册</Link>
        </p>

        <div className={styles.demoHint}>
          演示账号：demo / 123456
        </div>
      </div>
    </div>
  );
}
