import { useContext, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import ProductCard from '../components/ProductCard';
import styles from './CategoryPage.module.css';
import homeStyles from './HomePage.module.css';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const services = useContext(ServiceContext);
  const categories = services.category.getCategoryList();

  const category = categoryId
    ? services.category.getCategoryById(Number(categoryId))
    : null;

  const products = useMemo(() => {
    if (!categoryId) return [];
    return services.good.getGoodList({
      status: 'on',
      categoryId: Number(categoryId),
    });
  }, [services.good, categoryId]);

  if (categoryId && category) {
    return (
      <div className="container">
        <nav aria-label="面包屑" style={{ marginBottom: 16, fontSize: 14 }}>
          <Link to="/category">分类</Link>
          <span aria-hidden="true"> / </span>
          <span>{category.name}</span>
        </nav>
        <h1 className="page-title">{category.icon} {category.name}</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
          {category.description}
        </p>
        {products.length > 0 ? (
          <div className={homeStyles.grid}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>该分类暂无商品</h3>
            <Link to="/category" className="btn btn-secondary" style={{ marginTop: 16 }}>
              返回分类
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">商品分类</h1>
      <div className={styles.categoryGrid}>
        {categories.map((cat) => (
          <Link key={cat.id} to={`/category/${cat.id}`} className={styles.categoryCard}>
            <span className={styles.icon} aria-hidden="true">{cat.icon}</span>
            <div className={styles.info}>
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
