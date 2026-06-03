import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { carouselSlides } from '../mock/seedData';
import styles from './Carousel.module.css';

export default function Carousel({ slides = carouselSlides, interval = 5000 }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index) => {
    setCurrent((index + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => goTo(current + 1), interval);
    return () => clearInterval(timer);
  }, [current, paused, interval, goTo, slides.length]);

  return (
    <section
      className={styles.carousel}
      aria-label="轮播图"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={styles.track}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}`}
            aria-hidden={i !== current}
          >
            <Link to={slide.link} className={styles.slideLink}>
              <img
                src={slide.img}
                alt={slide.title}
                className={styles.image}
                width={1400}
                height={500}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
              />
              <div className={styles.overlay}>
                <h2 className={styles.title}>{slide.title}</h2>
                <p className={styles.subtitle}>{slide.subtitle}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.dots} role="tablist" aria-label="轮播图导航">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            aria-label={`第 ${i + 1} 张：${slide.title}`}
            aria-selected={i === current}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}
