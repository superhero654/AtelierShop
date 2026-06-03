import { useState, useContext, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/format';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './OrderPage.module.css';

function CreateOrderContent() {
  const services = useContext(ServiceContext);
  const { user } = useAuth();
  const { selectedItems, clearSelected } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const directGoodId = searchParams.get('goodId');
  const directCount = parseInt(searchParams.get('count') || '1', 10);

  const orderItems = useMemo(() => {
    if (directGoodId) {
      const good = services.good.getGoodById(parseInt(directGoodId, 10));
      if (good) {
        return [{ goodId: good.id, name: good.name, price: good.price, img: good.img, count: directCount }];
      }
    }
    return selectedItems;
  }, [directGoodId, directCount, selectedItems, services.good]);

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.count, 0);

  const [form, setForm] = useState({
    receiver: user?.nickname || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (orderItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>没有待结算的商品</h3>
          <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/cart')}>
            去购物车
          </button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!form.receiver.trim()) errs.receiver = '请输入收货人姓名';
    if (!form.phone.trim()) errs.phone = '请输入手机号';
    else if (!/^1\d{10}$/.test(form.phone)) errs.phone = '手机号格式不正确';
    if (!form.address.trim()) errs.address = '请输入收货地址';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const items = orderItems.map((item) => ({
      goodId: item.goodId,
      count: item.count,
      price: item.price,
    }));

    const order = services.order.createOrder({
      userId: user.id,
      items,
      address: form.address,
      receiver: form.receiver,
      phone: form.phone,
      totalPrice,
    });

    if (!directGoodId) {
      clearSelected();
    }

    setLoading(false);
    navigate(`/pay/${order.id}`);
  };

  return (
    <div className="container">
      <h1 className="page-title">确认订单</h1>

      <form onSubmit={handleSubmit}>
        <div className={styles.orderLayout}>
          <div>
            <section className={styles.section}>
              <h2>收货信息</h2>
              <div className="form-group">
                <label htmlFor="order-receiver">收货人</label>
                <input
                  id="order-receiver"
                  name="receiver"
                  type="text"
                  autoComplete="name"
                  value={form.receiver}
                  onChange={(e) => setForm({ ...form, receiver: e.target.value })}
                />
                {errors.receiver && <p className="form-error" role="alert">{errors.receiver}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="order-phone">手机号</label>
                <input
                  id="order-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {errors.phone && <p className="form-error" role="alert">{errors.phone}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="order-address">收货地址</label>
                <textarea
                  id="order-address"
                  name="address"
                  rows={3}
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                {errors.address && <p className="form-error" role="alert">{errors.address}</p>}
              </div>
            </section>

            <section className={styles.section}>
              <h2>商品清单</h2>
              {orderItems.map((item) => (
                <div key={item.goodId} className={styles.item}>
                  <img src={item.img} alt={item.name} width={64} height={64} loading="lazy" />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
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
          </div>

          <aside className={`${styles.section} ${styles.summary}`}>
            <h2>订单摘要</h2>
            <div className={styles.summaryRow}>
              <span>商品件数</span>
              <span>{orderItems.reduce((s, i) => s + i.count, 0)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>应付总额</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 16 }}
              disabled={loading}
            >
              {loading ? '提交中…' : '提交订单'}
            </button>
          </aside>
        </div>
      </form>
    </div>
  );
}

export default function CreateOrderPage() {
  return (
    <ProtectedRoute>
      <CreateOrderContent />
    </ProtectedRoute>
  );
}
