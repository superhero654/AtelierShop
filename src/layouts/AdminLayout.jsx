import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown } from 'antd';
import {
  ShoppingOutlined,
  OrderedListOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Sider, Header: AntHeader, Content } = Layout;

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    admin.role === 'admin' && {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
    },
    {
      key: '/admin/orders',
      icon: <OrderedListOutlined />,
      label: '订单管理',
    },
  ].filter(Boolean);

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: () => {
          logoutAdmin();
          navigate('/admin/login');
        },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={0} theme="light">
        <div style={{ padding: '16px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #f0f0f0' }}>
          Atelier 后台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <AntHeader
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Dropdown menu={userMenu}>
            <Button type="text" icon={<UserOutlined />}>
              {admin.name}（{admin.role === 'admin' ? '管理员' : '运营'}）
            </Button>
          </Dropdown>
        </AntHeader>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 360 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
