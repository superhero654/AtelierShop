import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCategoryById, useCategoryList, useGoodList } from '../hooks/useCatalog';
import styles from './CategoryPage.module.css';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const categories = useCategoryList();
  const parsedCategoryId = categoryId ? Number(categoryId) : null;
  const category = useCategoryById(parsedCategoryId);

  const products = useGoodList(
    parsedCategoryId
      ? { status: 'on', categoryId: parsedCategoryId }
      : { status: 'on', categoryId: 0 },
  );

  const displayProducts = parsedCategoryId ? products : [];

  return (
    <div className="container">
      <div className={styles.page}>
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
            {displayProducts.length > 0 ? (
              <div className={styles.productGrid}>
                {displayProducts.map((p) => (
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
