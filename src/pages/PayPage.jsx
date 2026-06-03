import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { formatPrice, formatDate } from '../utils/format';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './PayPage.module.css';

const COUNTDOWN_SECONDS = 15;

function PayContent() {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const parsedOrderId = parseInt(orderId, 10);

  const order = services.order.getOrderById(parsedOrderId);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (!order || order.status !== 0) return;
    if (countdown <= 0) {
      setStatus('timeout');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, order]);

  if (!order) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>订单不存在</h3>
          <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (order.status !== 0) {
    navigate(`/orderDetail/${orderId}`);
    return null;
  }

  const handlePay = (success) => {
    if (success) {
      services.order.payOrder(parsedOrderId);
      setStatus('success');
      setTimeout(() => navigate(`/orderDetail/${orderId}`), 1500);
    } else {
      setStatus('failed');
    }
  };

  if (status === 'success') {
    return (
      <div className="container">
        <div className={styles.payCard}>
          <div className={styles.successIcon} aria-hidden="true">✓</div>
          <h1>支付成功</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>正在跳转订单详情…</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="container">
        <div className={styles.payCard}>
          <div className={styles.failIcon} aria-hidden="true">✕</div>
          <h1>支付失败</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>请检查支付信息后重试</p>
          <div className={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={() => setStatus('pending')}>
              重新支付
            </button>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/orders')}>
              查看订单
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'timeout') {
    return (
      <div className="container">
        <div className={styles.payCard}>
          <h1>支付超时</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>订单已超时，请重新下单或继续支付</p>
          <div className={styles.actions}>
            <button type="button" className="btn btn-primary" onClick={() => { setCountdown(COUNTDOWN_SECONDS); setStatus('pending'); }}>
              继续支付
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/orders')}>
              查看订单
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.payCard}>
        <h1>收银台</h1>

        <div className={styles.orderInfo}>
          <p><span>订单号</span><span translate="no">{order.orderNo}</span></p>
          <p><span>创建时间</span><span>{formatDate(order.createTime)}</span></p>
          <p><span>收货人</span><span>{order.receiver}</span></p>
        </div>

        <div className={styles.amount}>{formatPrice(order.totalPrice)}</div>

        <div className={styles.timer} aria-live="polite">
          {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
        </div>
        <p className={styles.timerLabel}>请在倒计时内完成支付</p>

        <div className={styles.qrPlaceholder} aria-label="模拟支付二维码">
          模拟二维码
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn btn-primary" onClick={() => handlePay(true)}>
            模拟支付成功
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => handlePay(false)}>
            模拟支付失败
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <ProtectedRoute>
      <PayContent />
    </ProtectedRoute>
  );
}
