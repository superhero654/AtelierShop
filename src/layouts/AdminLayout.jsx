// src/layouts/AdminLayout.jsx
import { useState, Suspense } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Breadcrumb, Skeleton } from 'antd';
import {
  ShoppingOutlined,
  OrderedListOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

const { Sider, Header: AntHeader, Content } = Layout;

const BREADCRUMB_MAP = {
  '/admin/products': '商品管理',
  '/admin/categories': '分类管理',
  '/admin/orders': '订单管理',
};

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      const val = localStorage.getItem('admin_sider_collapsed');
      return val === 'true';
    } catch {
      return false;
    }
  });

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    admin.role === 'admin' && {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
    },
    admin.role === 'admin' && {
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: '分类管理',
    },
    {
      key: '/admin/orders',
      icon: <OrderedListOutlined />,
      label: '订单管理',
    },
  ].filter(Boolean);

  const handleCollapse = (val) => {
    setCollapsed(val);
    try {
      localStorage.setItem('admin_sider_collapsed', String(val));
    } catch {
      // ignore
    }
  };

  const breadcrumbItems = [
    { title: '后台管理' },
    ...(BREADCRUMB_MAP[location.pathname]
      ? [{ title: BREADCRUMB_MAP[location.pathname] }]
      : []),
  ];

  const userMenu = {
    items: [
      {
        key: 'current',
        label: `当前用户：${admin.username || admin.name}`,
        disabled: true,
      },
      { type: 'divider' },
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
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={handleCollapse}
        breakpoint="lg"
        collapsedWidth={0}
        theme="light"
      >
        <div style={{ padding: '16px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #f0f0f0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {collapsed ? '' : 'Atelier 后台'}
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
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => handleCollapse(!collapsed)}
          />
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              {admin.username || admin.name}
            </Button>
          </Dropdown>
        </AntHeader>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 360 }}>
          <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
          <ErrorBoundary>
            <Suspense fallback={<Skeleton active paragraph={{ rows: 4 }} />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
}
