import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import styles from './ProductCard.module.css';

function ProductCard({ product }) {
  return (
    <Link to={`/detail/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={product.img}
          alt={product.name}
          className={styles.image}
          width={600}
          height={600}
          loading="lazy"
        />
        {product.hot && <span className={styles.hotTag}>热门</span>}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.price}>{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}

export default memo(ProductCard);
