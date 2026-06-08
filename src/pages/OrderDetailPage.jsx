import { useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, formatDate } from '../utils/format';
import { ORDER_STATUS } from '../mock/seedData';
import styles from './OrderPage.module.css';
import userStyles from './UserPage.module.css';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const parsedOrderId = parseInt(orderId, 10);
  const order = services.order.getOrderById(parsedOrderId);

  if (!order) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>订单不存在</h3>
          <Link to="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>返回订单列表</Link>
        </div>
      </div>
    );
  }

  const items = (order.items || []).map((item) => {
    const good = services.good.getGoodById(item.goodId);
    return { ...item, good };
  });

  return (
    <div className="container">
      <nav aria-label="面包屑" style={{ marginBottom: 16, fontSize: 14 }}>
        <Link to="/orders">我的订单</Link>
        <span aria-hidden="true"> / </span>
        <span>订单详情</span>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>订单详情</h1>
        <span className={`${userStyles.statusTag} ${userStyles[`status${order.status}`]}`}>
          {ORDER_STATUS[order.status]?.label}
        </span>
      </div>

      <div className={styles.orderLayout}>
        <div>
          <section className={styles.section}>
            <h2>订单信息</h2>
            <div style={{ fontSize: 14, lineHeight: 2 }}>
              <p><strong>订单号：</strong><span translate="no">{order.orderNo}</span></p>
              <p><strong>创建时间：</strong>{formatDate(order.createTime)}</p>
              {order.payTime && <p><strong>支付时间：</strong>{formatDate(order.payTime)}</p>}
              <p><strong>收货人：</strong>{order.receiver}</p>
              <p><strong>手机号：</strong>{order.phone}</p>
              <p><strong>收货地址：</strong>{order.address}</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>商品信息</h2>
            {items.map((item) => (
              <div key={item.goodId} className={styles.item}>
                {item.good && (
                  <img src={item.good.img} alt={item.good.name} width={64} height={64} loading="lazy" />
                )}
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.good?.name || `商品 #${item.goodId}`}</div>
                  <div className={styles.itemMeta}>
                    {formatPrice(item.price)} × {item.count}
                  </div>
                </div>
                <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(item.price * item.count)}
                </span>
              </div>
            ))}
          </section>

          {order.logistics && (
            <section className={styles.section}>
              <h2>物流信息</h2>
              <div style={{ fontSize: 14, lineHeight: 2 }}>
                <p><strong>快递公司：</strong>{order.logistics.company}</p>
                <p><strong>运单号：</strong><span translate="no">{order.logistics.trackingNo}</span></p>
                <p><strong>物流状态：</strong>{order.logistics.status}</p>
              </div>
            </section>
          )}
        </div>

        <aside className={`${styles.section} ${styles.summary}`}>
          <h2>费用明细</h2>
          <div className={styles.summaryTotal}>
            <span>订单总额</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
          {order.status === 0 && user?.id === order.userId && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => navigate(`/pay/${order.id}`)}
            >
              去支付
            </button>
          )}
          {order.status === 2 && user?.id === order.userId && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={async () => {
                await services.order.completeOrder(order.id);
                navigate(0);
              }}
            >
              确认收货
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
