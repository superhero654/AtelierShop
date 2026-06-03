import { useContext, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import Carousel from '../components/Carousel';
import ProductCard from '../components/ProductCard';
import styles from './HomePage.module.css';

export default function HomePage() {
  const services = useContext(ServiceContext);
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';

  const products = useMemo(() => {
    const filters = { status: 'on' };
    if (keyword) filters.keyword = keyword;
    return services.good.getGoodList(filters);
  }, [services.good, keyword]);

  const hotProducts = useMemo(
    () => services.good.getGoodList({ status: 'on', hot: true }),
    [services.good]
  );

  return (
    <div className="container">
      {!keyword && (
        <section className={styles.hero} aria-label="轮播推荐">
          <Carousel />
        </section>
      )}

      {keyword ? (
        <section className={styles.section}>
          <h1 className="page-title">搜索结果</h1>
          <p className={styles.searchResult}>
            关键词「{keyword}」共找到 {products.length} 件商品
          </p>
          {products.length > 0 ? (
            <div className={styles.grid}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>未找到相关商品</h3>
              <p>试试其他关键词，或浏览全部分类</p>
              <Link to="/category" className="btn btn-primary" style={{ marginTop: 16 }}>
                浏览分类
              </Link>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className="section-title">热门精选</h2>
              <Link to="/category" className={styles.moreLink}>
                查看全部 →
              </Link>
            </div>
            <div className={styles.grid}>
              {hotProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className="section-title">全部商品</h2>
            </div>
            <div className={styles.grid}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
