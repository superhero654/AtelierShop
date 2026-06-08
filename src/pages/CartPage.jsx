import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/format';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './CartPage.module.css';

function CartContent() {
  const navigate = useNavigate();
  const {
    items,
    selectedItems,
    selectedTotal,
    allSelected,
    toggleSelect,
    toggleSelectAll,
    updateCount,
    removeFromCart,
  } = useCart();

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    navigate('/createOrder');
  };

  if (items.length === 0) {
    return (
      <div className="container">
        <h1 className="page-title">购物车</h1>
        <div className="empty-state">
          <h3>购物车是空的</h3>
          <p>去挑选一些心仪的商品吧</p>
          <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            去逛逛
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">购物车</h1>

      <div className={styles.cartTable}>
        <div className={styles.header} role="row">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleSelectAll(e.target.checked)}
            aria-label="全选"
            style={{ margin: 0 }}
          />
          <span>商品</span>
          <span>单价</span>
          <span>数量</span>
          <span>操作</span>
        </div>

        {items.map((item) => (
          <div key={item.goodId} className={styles.row} role="row">
            <input
              type="checkbox"
              checked={item.selected}
              onChange={() => toggleSelect(item.goodId)}
              aria-label={`选择 ${item.name}`}
            />
            <div className={styles.product}>
              <img src={item.img} alt={item.name} width={72} height={72} loading="lazy" />
              <span className={styles.productName}>{item.name}</span>
            </div>
            <span className={styles.price}>{formatPrice(item.price)}</span>
            <div className={styles.quantity}>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => updateCount(item.goodId, item.count - 1)}
                disabled={item.count <= 1}
                aria-label="减少数量"
              >
                −
              </button>
              <span className={styles.qtyValue}>{item.count}</span>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => updateCount(item.goodId, item.count + 1)}
                aria-label="增加数量"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeFromCart(item.goodId)}
            >
              删除
            </button>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleSelectAll(e.target.checked)}
          />
          全选
        </label>
        <div className={styles.total}>
          合计：<span>{formatPrice(selectedTotal)}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={selectedItems.length === 0}
          onClick={handleCheckout}
        >
          结算（{selectedItems.length}）
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
