import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <div className={styles.brand}>Atelier Shop</div>
          <p className={styles.desc}>
            编辑式精品商城，精选全球好物，为你打造独特的生活美学。
          </p>
        </div>
        <div className={styles.col}>
          <h4>购物指南</h4>
          <Link to="/category">商品分类</Link>
          <Link to="/cart">购物车</Link>
          <Link to="/orders">我的订单</Link>
        </div>
        <div className={styles.col}>
          <h4>关于我们</h4>
          <Link to="/user">个人中心</Link>
          <Link to="/admin/login">商家后台</Link>
        </div>
      </div>
      <div className={styles.bottom}>
        © 2026 Atelier Shop. All rights reserved.
      </div>
    </footer>
  );
}
