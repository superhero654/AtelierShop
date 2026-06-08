import { useContext, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import ProductCard from '../components/ProductCard';
import styles from './CategoryPage.module.css';

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

  return (
    <div className="container">
      <div className={styles.page}>
        {/* ---- 左侧竖列分类导航（仿京东全部分类栏） ---- */}
        <nav className={styles.sidebar} aria-label="商品分类">
          <div className={styles.sidebarTitle}>全部商品分类</div>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`${styles.sidebarItem} ${category && category.id === cat.id ? styles.sidebarItemActive : ''}`}
            >
              <span>{cat.name}</span>
              <span className={styles.arrow} aria-hidden="true">&gt;</span>
            </Link>
          ))}
        </nav>

        {/* ---- 右侧内容区 ---- */}
        {categoryId && category ? (
          <div className={styles.content}>
            <div className={styles.breadcrumb}>
              <Link to="/category">全部分类</Link>
              <span aria-hidden="true"> &gt; </span>
              <span>{category.name}</span>
            </div>
            <div className={styles.contentHeader}>
              <h1>{category.name}</h1>
              <span className={styles.desc}>{category.description}</span>
            </div>
            {products.length > 0 ? (
              <div className={styles.productGrid}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>该分类暂无商品</h3>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.defaultContent}>
            <h2>全部分类</h2>
            <p>请从左侧选择商品分类进行浏览</p>
            <div className={styles.hotTags}>
              {categories.slice(0, 8).map((cat) => (
                <Link key={cat.id} to={`/category/${cat.id}`} className={styles.hotTag}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
