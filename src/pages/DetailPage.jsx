import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/format';
import styles from './DetailPage.module.css';

export default function DetailPage() {
  const { goodId } = useParams();
  const parsedGoodId = parseInt(goodId, 10);
  const services = useContext(ServiceContext);
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [count, setCount] = useState(1);
  const [toast, setToast] = useState('');

  const good = services.good.getGoodById(parsedGoodId);
  const category = good ? services.category.getCategoryById(good.categoryId) : null;

  useEffect(() => {
    if (!good) {
      navigate('/');
    }
  }, [good, navigate]);

  if (!good || good.status === 'off') {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>商品不存在或已下架</h3>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>返回首页</Link>
        </div>
      </div>
    );
  }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const requireLogin = (action) => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/detail/${goodId}`)}`);
      return;
    }
    action();
  };

  const handleAddToCart = () => {
    requireLogin(() => {
      addToCart(good, count);
      showToast('已加入购物车');
    });
  };

  const handleBuyNow = () => {
    requireLogin(() => {
      navigate(`/createOrder?goodId=${goodId}&count=${count}`);
    });
  };

  return (
    <div className="container">
      <nav aria-label="面包屑" style={{ marginBottom: 16, fontSize: 14 }}>
        <Link to="/">首页</Link>
        {category && (
          <>
            <span aria-hidden="true"> / </span>
            <Link to={`/category/${category.id}`}>{category.name}</Link>
          </>
        )}
        <span aria-hidden="true"> / </span>
        <span>{good.name}</span>
      </nav>

      <article className={styles.detail}>
        <div className={styles.imageWrap}>
          <img
            src={good.img}
            alt={good.name}
            className={styles.image}
            width={600}
            height={600}
            fetchPriority="high"
          />
        </div>

        <div className={styles.info}>
          <h1>{good.name}</h1>
          <div className={styles.price}>{formatPrice(good.price)}</div>

          <div className={styles.meta}>
            <span>库存：{good.stock}</span>
            {category && <span>分类：{category.name}</span>}
          </div>

          <p className={styles.desc}>{good.description}</p>

          <div className={styles.quantityRow}>
            <span className={styles.qtyLabel}>数量</span>
            <div className={styles.qtyControl}>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setCount(Math.max(1, count - 1))}
                disabled={count <= 1}
                aria-label="减少数量"
              >
                −
              </button>
              <span className={styles.qtyValue}>{count}</span>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setCount(Math.min(good.stock, count + 1))}
                disabled={count >= good.stock}
                aria-label="增加数量"
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={handleAddToCart}>
              加入购物车
            </button>
            <button type="button" className="btn btn-primary" onClick={handleBuyNow}>
              立即购买
            </button>
          </div>
        </div>
      </article>

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
