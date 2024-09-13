import React, { useEffect, useState } from 'react';
import './Profile.css';
import Navbar from './components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSync } from '@fortawesome/free-solid-svg-icons';
import { FaCopy } from 'react-icons/fa';
import { useUser } from './UserContext';
import Loading from './components/Loading';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';

const StarRating = React.memo(({ rating = 1 }) => {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <FontAwesomeIcon key={i} icon={faStar} className={i < rating ? 'star filled' : 'star'} />
  ));
  return (
    <div className="star-rating">
      {stars}
      <span className="rating-number">{rating}</span>
    </div>
  );
});

const Profile = () => {
  const { user, loading, updateUser } = useUser();
  const navigate = useNavigate();
  const placeholderAvatar = 'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png';
  const avatarUrl = user && user.avatar ? user.avatar : placeholderAvatar;

  const [inviteCount, setInviteCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      const fetchInviteCount = async () => {
        try {
          const invitesRef = collection(db, 'invites');
          const q = query(invitesRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          setInviteCount(querySnapshot.size);
        } catch (error) {
          console.error('Ошибка при получении количества приглашений:', error);
        }
      };

      fetchInviteCount();
    }
  }, [loading, user, navigate]);

  const translateRole = (role) => {
    switch (role) {
      case 'freelancer':
        return 'Фрилансер';
      case 'client':
        return 'Заказчик';
      default:
        return 'Неизвестная роль';
    }
  };

  const handleUpdateClick = async () => {
    try {
      // Загрузка данных пользователя снова
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
    }
  };
  

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-content">
          <div className="card-container">
            <h3>Пользователь не зарегистрирован</h3>
            <p>Пожалуйста, <Link to="/register">зарегистрируйтесь</Link> или <Link to="/login">войдите</Link> в систему.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleTelegramClick = () => {
    const url = `https://t.me/${user.telegramUsername}`;
    window.open(url, '_blank');
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(user.telegramUsername);
  };

  const handleEditClick = () => {
    navigate('/editprofile');
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-content">
        <div className="card-container">
          <img className="round" src={avatarUrl || placeholderAvatar} alt="user" />
          <h3>{user.username}</h3>
          <p>{user.description || 'Нет описания'}</p>
          <div className="button-group">
            <button className="primary" onClick={handleEditClick}>Редактировать</button>
            <button className="primary ghost" onClick={handleCopyClick}>
              <FaCopy className="copy-icon" /> Копировать @Telegram
            </button>
            <button className="refresh-button" onClick={handleUpdateClick}>
              <FontAwesomeIcon icon={faSync} />
            </button>
          </div>
          <div className="rating">
            <h6>Рейтинг</h6>
            <StarRating rating={user.rating} />
          </div>
          <div className="links">
            <Link to="/my-orders">Мои заказы</Link>
            <Link to="/my-services">Мои услуги</Link>
            <Link to="/my-projects">Мои проекты</Link>
          </div>
          <div className="skills">
            <h6>Навыки</h6>
            <ul>
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))
              ) : (
                <li>Навыки не указаны</li>
              )}
            </ul>
          </div>
          <div className="user-info">
            <h6>Дополнительная информация</h6>
            <div className="info-item">
              <span>Архивные заказы:</span> {user.archivedOrders}
            </div>
            <div className="info-item">
              <span>Роль:</span> {translateRole(user.role)}
            </div>
          </div>
          <div className="my-responses">
            <Link to="/my-responses" className="response-link">
              Мои Отклики
            </Link>
          </div>
          <div className="my-invites">
            <Link to="/my-invites" className="invite-link">
              Приглашения ({inviteCount})
            </Link>
          </div>
          <div className="my-deals">
            <Link to="/my-deals" className="deal-link">
              Сделки (0)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
