import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrdersByUserId } from '../hooks/useCatalog';
import { formatPrice, formatDate } from '../utils/format';
import { ORDER_STATUS } from '../mock/seedData';
import styles from './UserPage.module.css';

export default function UserPage() {
  const { user, isLoggedIn, logoutUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({
    nickname: user?.nickname || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        nickname: user.nickname || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const orders = useOrdersByUserId(user?.id);

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>请先登录</h3>
          <p>登录后查看个人信息和订单</p>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>
            去登录
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="container">
      <h1 className="page-title">我的</h1>

      <div className={styles.profile}>
        <aside className={styles.sidebar}>
          <div className={styles.avatar} aria-hidden="true">
            {user.nickname.charAt(0).toUpperCase()}
          </div>
          <div className={styles.nickname}>{user.nickname}</div>
          <div className={styles.email}>{user.email}</div>

          <button
            type="button"
            className={`${styles.menuBtn} ${tab === 'profile' ? styles.menuBtnActive : ''}`}
            onClick={() => setTab('profile')}
          >
            个人信息
          </button>
          <button
            type="button"
            className={`${styles.menuBtn} ${tab === 'orders' ? styles.menuBtnActive : ''}`}
            onClick={() => setTab('orders')}
          >
            我的订单
          </button>
          <button type="button" className={styles.menuBtn} onClick={handleLogout}>
            退出登录
          </button>
        </aside>

        <div className={styles.content}>
          {tab === 'profile' && (
            <>
              <h2 className="section-title">个人信息</h2>
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label htmlFor="profile-nickname">昵称</label>
                  <input
                    id="profile-nickname"
                    name="nickname"
                    type="text"
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-phone">手机号</label>
                  <input
                    id="profile-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-address">默认地址</label>
                  <textarea
                    id="profile-address"
                    name="address"
                    rows={3}
                    autoComplete="street-address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  保存修改
                </button>
                {saved && (
                  <span role="status" aria-live="polite" style={{ marginLeft: 12, color: 'var(--color-success)' }}>
                    已保存
                  </span>
                )}
              </form>
            </>
          )}

          {tab === 'orders' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>我的订单</h2>
                <Link to="/orders">查看全部 →</Link>
              </div>
              {orders.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <p>暂无订单</p>
                </div>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div key={order.id} className={styles.orderItem}>
                    <div>
                      <div className={styles.orderNo}>{order.orderNo}</div>
                      <div className={styles.orderMeta}>
                        {formatDate(order.createTime)} · {formatPrice(order.totalPrice)}
                      </div>
                    </div>
                    <span className={`${styles.statusTag} ${styles[`status${order.status}`]}`}>
                      {ORDER_STATUS[order.status]?.label}
                    </span>
                    <Link to={`/orderDetail/${order.id}`} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }}>
                      详情
                    </Link>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
