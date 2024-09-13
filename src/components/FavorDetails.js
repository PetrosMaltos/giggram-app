import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AiFillStar } from 'react-icons/ai';
import { FaDollarSign, FaEye, FaClock, FaCommentDots, FaLock } from 'react-icons/fa';
import './FavorDetails.css';
import { db, auth } from '../firebaseConfig';
import { setDoc, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Loading from './Loading';

const FavorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [favor, setFavor] = useState(null);
  const [request, setRequest] = useState('');
  const [timeAgo, setTimeAgo] = useState('');
  const [userData, setUserData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const fetchFavor = async () => {
      if (!id) {
        console.error('ID услуги не найден');
        return;
      }

      try {
        const favorRef = doc(db, 'favors', id);
        const favorSnap = await getDoc(favorRef);
        if (favorSnap.exists()) {
          const favorData = favorSnap.data();
          setFavor(favorData);
          setRequests(favorData.requests || []);

          // Работа с временем создания услуги
          let createdAtDate;

          if (favorData.createdAt instanceof Date) {
            createdAtDate = favorData.createdAt;
          } else if (favorData.createdAt && favorData.createdAt.toDate) {
            createdAtDate = favorData.createdAt.toDate();
          } else {
            createdAtDate = new Date(favorData.createdAt);
          }

          const updateTimer = () => {
            setTimeAgo(formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru }));
          };

          updateTimer();
          const timer = setInterval(updateTimer, 60000); // Обновляем каждую минуту

          return () => clearInterval(timer);
        } else {
          console.error('Услуга не найдена');
        }
      } catch (error) {
        console.error('Ошибка получения данных услуги:', error);
      }
    };

    fetchFavor();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserLoggedIn(true);
        fetchUserData(user.uid);
      } else {
        setIsUserLoggedIn(false);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const fetchUserData = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserData(userData);
        setHasSubscription(userData.subscription);
      } else {
        console.warn('Пользователь не зарегистрирован в базе данных');
      }
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
    }
  };

  const handleRequestChange = (e) => {
    setRequest(e.target.value);
  };

  const handleSubmit = async () => {
    if (userData && request.trim()) {
      if (!hasSubscription) {
        alert('Для запроса услуги необходимо иметь подписку.');
        return;
      }
      try {
        const newRequest = {
          userId: userData.uid,
          text: request.trim(),
          createdAt: new Date(),
        };
        const favorRef = doc(db, 'favors', id);
        await updateDoc(favorRef, { requests: arrayUnion(newRequest) });
        setRequests((prevRequests) => [...prevRequests, newRequest]);
        setRequest('');
        alert('Ваш запрос отправлен!');
      } catch (error) {
        console.error('Ошибка отправки запроса:', error);
        alert('Произошла ошибка при отправке запроса. Пожалуйста, попробуйте еще раз.');
      }
    } else {
      alert('Вы должны быть зарегистрированы и написать запрос, чтобы отправить его.');
    }
  };

  if (!favor) {
    return <Loading />;
  }

  return (
    <div className="favor-detail">
      <div className="favor-info">
        <h1 className="favor-title">{favor.title}</h1>
        <p className="favor-description">{favor.description}</p>
        <div className="favor-details">
          <div className="favor-info-item">
            <FaDollarSign className="favor-icon" />
            <span className="favor-price">{favor.price} руб.</span>
          </div>
          <div className="favor-info-item">
            <FaEye className="favor-icon" />
            <span className="favor-views">{favor.views || 0} просмотров</span>
          </div>
          <div className="favor-info-item">
            <FaClock className="favor-icon" />
            <span className="favor-time">{timeAgo}</span>
          </div>
          <div className="favor-info-item">
            <FaCommentDots className="favor-icon" />
            <span className="favor-requests">{requests.length} запросов</span>
          </div>
        </div>
        <div className="favor-tags">
          {favor.tags && favor.tags.length > 0 ? (
            favor.tags.map((tag, index) => (
              <span key={index} className="tag"># {tag}</span>
            ))
          ) : (
            <span className="favor-tag">Нет тегов</span>
          )}
        </div>
        <div className="divider" />
        <div className="request-section">
          {isUserLoggedIn ? (
            hasSubscription ? (
              <div className="request-form">
                <textarea
                  className="request-textarea"
                  placeholder="Напишите ваш запрос здесь..."
                  value={request}
                  onChange={handleRequestChange}
                />
                <button
                  className="request-button"
                  onClick={handleSubmit}
                >
                  Отправить
                </button>
              </div>
            ) : (
              <div className="subscription-message">
                <FaLock className="lock-icon" />
                <h2>У вас нет подписки</h2>
                <p>Для запроса услуги необходимо иметь подписку. Пожалуйста, <a href="/subscribe">подпишитесь</a> для продолжения.</p>
              </div>
            )
          ) : (
            <div className="registration-message">
              <FaLock className="lock-icon" />
              <h2>Пожалуйста, зарегистрируйтесь</h2>
              <p>Для отправки запроса на услугу необходимо зарегистрироваться. Пожалуйста, <a href="/register">зарегистрируйтесь</a> для продолжения.</p>
            </div>
          )}
        </div>
        {userData?.role === 'client' && (
          <div className="requests-list">
            {requests.length > 0 ? (
              requests.map((req, index) => {
                const createdAtDate = req.createdAt.toDate ? req.createdAt.toDate() : new Date(req.createdAt);
                const username = userMap[req.userId]?.username || 'Неизвестный пользователь';
                const avatar = userMap[req.userId]?.avatar || 'default-avatar.png';
                return (
                  <div key={index} className="request-item">
                    <div className="request-header">
                      <img src={avatar} alt="User Avatar" className="request-avatar" />
                      <span className="request-username">{username}</span>
                      <span className="request-date">{formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru })}</span>
                    </div>
                    <div className="request-text">{req.text}</div>
                  </div>
                );
              })
            ) : (
              <p>Нет запросов.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavorDetails;
