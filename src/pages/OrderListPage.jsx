import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { ServiceContext } from '../contexts/ServiceContext';
import { useSyncedUserOrders } from '../hooks/useCatalog';
import { formatPrice, formatDate } from '../utils/format';
import { ORDER_STATUS } from '../mock/seedData';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './UserPage.module.css';

function OrderListContent() {
  const { user } = useAuth();
  const { refreshCatalog } = useContext(ServiceContext);
  const [refreshing, setRefreshing] = useState(false);
  const orders = useSyncedUserOrders(user?.id);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCatalog('orders');
    } catch {
      message.error('刷新失败，请稍后重试');
    } finally {
      setRefreshing(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>我的订单</h1>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={refreshing}
            onClick={handleRefresh}
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            {refreshing ? '刷新中…' : '刷新状态'}
          </button>
        </div>
        <div className="empty-state">
          <h3>暂无订单</h3>
          <p>去发现一些好物吧</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>去逛逛</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>我的订单</h1>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={refreshing}
          onClick={handleRefresh}
          style={{ padding: '6px 14px', fontSize: 13 }}
        >
          {refreshing ? '刷新中…' : '刷新状态'}
        </button>
      </div>
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-sm)' }}>
        {orders.map((order) => (
          <div key={`${order.id}-${order.status}`} className={styles.orderItem}>
            <div>
              <div className={styles.orderNo}>{order.orderNo}</div>
              <div className={styles.orderMeta}>
                {formatDate(order.createTime)} · {formatPrice(order.totalPrice)} · {order.items?.length || 0} 件商品
              </div>
            </div>
            <span className={`${styles.statusTag} ${styles[`status${order.status}`]}`}>
              {ORDER_STATUS[order.status]?.label}
            </span>
            {order.status === 0 && (
              <Link to={`/pay/${order.id}`} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 13 }}>
                去支付
              </Link>
            )}
            <Link to={`/orderDetail/${order.id}`} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }}>
              详情
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderListPage() {
  return (
    <ProtectedRoute>
      <OrderListContent />
    </ProtectedRoute>
  );
}
