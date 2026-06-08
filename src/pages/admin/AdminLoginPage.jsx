// src/pages/admin/AdminLoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const onFinish = (values) => {
    setLoading(true);
    try {
      const result = loginAdmin(values.username, values.password);
      if (result.success) {
        navigate(result.admin.role === 'operator' ? '/admin/orders' : '/admin/products');
      } else {
        setErrorMsg(result.error || '登录失败');
      }
    } catch (err) {
      setErrorMsg('登录异常，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          width: 380,
          padding: 40,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo 区域 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ShopOutlined style={{ fontSize: 36, color: '#667eea' }} />
          <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
            商城管理系统
          </Title>
        </div>

        {/* 错误提示 */}
        {errorMsg && (
          <Alert
            type="error"
            message={errorMsg}
            showIcon
            closable
            onClose={() => setErrorMsg('')}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form onFinish={onFinish} layout="vertical" autoComplete="off" size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入管理员账号' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号…"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码…"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>

        <p style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 16 }}>
          演示：admin / admin123（管理员）· operator / op123456（运营）
        </p>
      </div>
    </div>
  );
}
