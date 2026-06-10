// src/pages/admin/AdminLoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminLoginPage.module.css';

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: '管理员' },
  { username: 'operator', password: 'op123456', role: '运营' },
];

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await loginAdmin(values.username, values.password);
      if (result.success) {
        navigate(result.admin.role === 'operator' ? '/admin/orders' : '/admin/products');
      } else {
        setErrorMsg(result.error || '登录失败');
      }
    } catch {
      setErrorMsg('登录异常，请重试');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    form.setFieldsValue({ username: account.username, password: account.password });
    setErrorMsg('');
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#C81E2B',
          borderRadius: 6,
        },
      }}
    >
      <div className={styles.page}>
        <aside className={styles.brandPanel} aria-hidden="true">
          <div className={styles.brandContent}>
            <span className={styles.brandBadge}>Admin Console</span>
            <h1 className={styles.brandTitle}>Atelier Shop<br />商家管理后台</h1>
            <p className={styles.brandDesc}>
              统一管理商品、分类与订单，实时掌握店铺运营数据。
            </p>
            <ul className={styles.featureList}>
              <li><span className={styles.featureDot} />商品与分类管理</li>
              <li><span className={styles.featureDot} />订单状态跟踪</li>
              <li><span className={styles.featureDot} />角色权限控制</li>
            </ul>
          </div>
        </aside>

        <main className={styles.formPanel}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>管理员登录</h2>
              <p>请输入您的后台账号与密码</p>
            </div>

            {errorMsg && (
              <Alert
                type="error"
                message={errorMsg}
                showIcon
                closable
                onClose={() => setErrorMsg('')}
                style={{ marginBottom: 20 }}
              />
            )}

            <Form
              form={form}
              onFinish={onFinish}
              layout="vertical"
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入管理员账号' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="管理员账号"
                  autoComplete="username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="登录密码"
                  autoComplete="current-password"
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  登 录
                </Button>
              </Form.Item>
            </Form>

            <div className={styles.demoSection}>
              <p className={styles.demoLabel}>演示账号（点击快速填入）</p>
              <div className={styles.demoAccounts}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    className={styles.demoBtn}
                    onClick={() => fillDemo(acc)}
                  >
                    <span>{acc.username} / {acc.password}</span>
                    <span className={styles.demoRole}>{acc.role}</span>
                  </button>
                ))}
              </div>
            </div>

            <Link to="/" className={styles.backLink}>
              ← 返回商城首页
            </Link>
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}
