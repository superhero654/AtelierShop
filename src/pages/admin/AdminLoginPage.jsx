import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const result = await loginAdmin(values.username, values.password);
    setLoading(false);
    if (result.success) {
      message.success('登录成功');
      navigate(result.admin.role === 'operator' ? '/admin/orders' : '/admin/products');
    } else {
      message.error(result.error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <Card title="Atelier 后台管理" style={{ width: '100%', maxWidth: 400 }}>
        <Form onFinish={onFinish} layout="vertical" autoComplete="off">
          <Form.Item
            name="username"
            label="管理员账号"
            rules={[{ required: true, message: '请输入管理员账号' }]}
          >
            <Input prefix={<UserOutlined aria-hidden="true" />} placeholder="admin…" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined aria-hidden="true" />} placeholder="请输入密码…" autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <p style={{ textAlign: 'center', color: '#999', fontSize: 13 }}>
          演示：admin / admin123（管理员）· operator / op123456（运营）
        </p>
      </Card>
    </div>
  );
}
