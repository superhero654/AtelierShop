import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, formatDate } from '../utils/format';
import { ORDER_STATUS } from '../mock/seedData';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './UserPage.module.css';

function OrderListContent() {
  const services = useContext(ServiceContext);
  const { user } = useAuth();

  const orders = useMemo(
    () => services.order.getOrdersByUserId(user.id),
    [services.order, user.id]
  );

  if (orders.length === 0) {
    return (
      <div className="container">
        <h1 className="page-title">我的订单</h1>
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
      <h1 className="page-title">我的订单</h1>
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-sm)' }}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderItem}>
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
