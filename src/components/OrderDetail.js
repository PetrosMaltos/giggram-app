import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AiFillStar } from 'react-icons/ai';
import { FaDollarSign, FaEye, FaClock, FaCommentDots, FaLock, FaLink, FaReply, FaTimes } from 'react-icons/fa';
import './OrderDetail.css';
import { db, auth } from '../firebaseConfig';
import { setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Loading from './Loading';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [response, setResponse] = useState('');
  const [timeAgo, setTimeAgo] = useState('');
  const [userData, setUserData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [remainingResponses, setRemainingResponses] = useState(5);
  const [creatorData, setCreatorData] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        console.error('ID заказа не найден');
        return;
      }
      try {
        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          setOrder(orderData);
          setResponses(orderData.responses || []);

          const userIds = orderData.responses.map(res => res.userId);
          const userMapTemp = {};
          for (const userId of userIds) {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              userMapTemp[userId] = userSnap.data();
            }
          }
          setUserMap(userMapTemp);

          let createdAtDate;
          if (orderData.createdAt instanceof Date) {
            createdAtDate = orderData.createdAt;
          } else if (orderData.createdAt && orderData.createdAt.toDate) {
            createdAtDate = orderData.createdAt.toDate();
          } else {
            createdAtDate = new Date(orderData.createdAt);
          }

          const updateTimer = () => {
            setTimeAgo(formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru }));
          };
          updateTimer();
          const timer = setInterval(updateTimer, 60000);

          if (orderData.createdBy) {
            const creatorRef = doc(db, 'users', orderData.createdBy);
            const creatorSnap = await getDoc(creatorRef);
            if (creatorSnap.exists()) {
              setCreatorData(creatorSnap.data());
            }
          }

          return () => clearInterval(timer);
        } else {
          console.error('Заказ не найден');
        }
      } catch (error) {
        console.error('Ошибка получения данных заказа:', error);
      }
    };

    fetchOrder();

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
        updateRemainingResponses(userData);
      } else {
        console.warn('Пользователь не зарегистрирован в базе данных');
      }
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
    }
  };

  const updateRemainingResponses = (userData) => {
    const today = new Date().toISOString().split('T')[0];
    const userResponsesToday = userData.responsesToday || [];
    const responsesForToday = userResponsesToday.filter(
      (response) => response.date && response.date.split('T')[0] === today
    );
    const remainingResponses = 5 - responsesForToday.length;
    setRemainingResponses(remainingResponses < 0 ? 0 : remainingResponses);
  };

  const handleResponseChange = (e) => {
    setResponse(e.target.value);
  };

  const handleSubmit = async () => {
    if (userData && response.trim()) {
      if (userData.uid === order.createdBy) {
        alert('Вы не можете откликаться на свой собственный заказ.');
        return;
      }

      const userHasResponded = responses.some(res => res.userId === userData.uid);
      if (userHasResponded) {
        alert('Вы уже откликнулись на этот заказ.');
        return;
      }

      if (remainingResponses <= 0) {
        alert('Вы исчерпали лимит откликов на сегодня.');
        return;
      }

      try {
        const newResponse = {
          userId: userData.uid,
          text: response.trim(),
          createdAt: new Date().toISOString(),
        };

        const orderRef = doc(db, 'orders', id);
        await updateDoc(orderRef, { responses: arrayUnion(newResponse) });

        const userRef = doc(db, 'users', userData.uid);
        await updateDoc(userRef, { responsesToday: arrayUnion(newResponse) });

        setRemainingResponses((prev) => Math.max(prev - 1, 0));
        setResponses((prevResponses) => [...prevResponses, newResponse]);
        setResponse('');
        alert('Ваш отклик отправлен!');
      } catch (error) {
        console.error('Ошибка отправки отклика:', error);
        alert('Произошла ошибка при отправке отклика. Пожалуйста, попробуйте еще раз.');
      }
    } else {
      alert('Вы должны быть зарегистрированы и написать отклик, чтобы отправить его.');
    }
  };

  const handleAcceptResponse = async (response) => {
    try {
      const orderRef = doc(db, 'orders', id);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();
      if (!orderData) {
        console.error('Данные заказа не найдены');
        return;
      }

      const dealData = {
        clientId: orderData.clientId,
        freelancerId: response.userId,
        projectTitle: orderData.title,
        status: 'in-progress',
        paymentStatus: 'pending',
        price: orderData.price,
        createdAt: new Date(),
        deadlines: orderData.deadline,
      };

      const freelancerDealRef = doc(db, 'deals', `${response.userId}_${id}`);
      await setDoc(freelancerDealRef, dealData);

      const clientDealRef = doc(db, 'deals', `${orderData.clientId}_${id}`);
      await setDoc(clientDealRef, { ...dealData, freelancerId: response.userId });

      await updateDoc(orderRef, { acceptedResponse: response, status: 'in-progress' });

      alert('Отклик принят, сделка создана для обоих пользователей!');
    } catch (error) {
      console.error('Ошибка принятия отклика:', error);
    }
  };

  const handleRejectResponse = async (response) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { responses: arrayRemove(response) });
      setResponses((prevResponses) => prevResponses.filter(res => res !== response));
      alert('Отклик отклонен.');
    } catch (error) {
      console.error('Ошибка отклонения отклика:', error);
    }
  };

  const handleReplyToResponse = (responseId, replyText) => {
    setResponses((prevResponses) =>
      prevResponses.map((res) =>
        res.id === responseId ? { ...res, reply: replyText } : res
      )
    );
  };

  const toggleReply = (index) => {
    const newResponses = [...responses];
    newResponses[index].isReplyOpen = !newResponses[index].isReplyOpen;
    setResponses(newResponses);
  };

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.BackButton.show();
      const handleBackButtonClick = () => window.history.back();
      window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);
      return () => {
        window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
        window.Telegram.WebApp.BackButton.hide();
      };
    }
    return () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.hide();
      }
    };
  }, []);

  if (!order) {
    return <Loading />;
  }

  return (
    <div className="order-detail">
      {!order || !userData ? (
        <Loading />
      ) : (
        <>
          <div className="order-info">
            <div className="client-profile">
              <div className="client-avatar">
                {creatorData?.avatar ? (
                  <img src={creatorData.avatar} alt="Client Avatar" />
                ) : (
                  <div className="default-avatar">A</div>
                )}
              </div>
              <div className="client-info">
                <div className="client-name">{creatorData?.username || 'Загружаю...'}</div>
                <div className="client-reviews">
                  <AiFillStar className="star-rating" />
                  <span>4.4</span>
                </div>
              </div>
            </div>
            <h1 className="order-title">{order.title}</h1>
            <p className="order-description">{order.description}</p>
            <div className="order-details">
              <div className="order-info-item">
                <FaDollarSign className="order-icon" />
                <span className="order-price">{order.price} руб.</span>
              </div>
              <div className="order-info-item">
                <FaEye className="order-icon" />
                <span className="order-views">{order.views || 0} просмотров</span>
              </div>
              <div className="order-info-item">
                <FaClock className="order-icon" />
                <span className="order-time">{timeAgo}</span>
              </div>
              <div className="order-info-item">
                <FaCommentDots className="order-icon" />
                <span className="order-responses">{responses.length} откликов</span>
              </div>
            </div>
            <div className="order-tags">
              {order.tags && order.tags.length > 0 ? (
                order.tags.map((tag, index) => (
                  <span key={index} className="tag"># {tag}</span>
                ))
              ) : (
                <span className="order-tag">Нет тегов</span>
              )}
            </div>
            <div className="divider" />
          </div>
          {userData.uid === order.createdBy ? (
            <div className="responses-list">
              <h2>Отклики</h2>
              {responses.length > 0 ? (
                responses.map((res, index) => {
                  const createdAtDate = res.createdAt.toDate ? res.createdAt.toDate() : new Date(res.createdAt);
                  const username = userMap[res.userId]?.username || 'Загружаю...';
                  const avatar = userMap[res.userId]?.avatar || 'Загружаю...';
                  return (
                    <div key={index} className="response-item">
                      <div className="response-header">
                        <div className="response-avatar">
                          <img src={avatar} alt="User Avatar" />
                        </div>
                        <a href={`/users/${res.userId}`} className="response-username">
                          {username}
                        </a>
                        <span className="response-date">{formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru })}</span>
                      </div>
                      <div className="response-text">{res.text}</div>
                      {order.acceptedResponse !== res && (
                        <div className="response-buttons">
                          <button className="accept-button" onClick={() => handleAcceptResponse(res)}>Начать сделку</button>
                          <button className="reject-button-response" onClick={() => handleRejectResponse(res)}>Отказать</button>
                        </div>
                      )}
                      <button className="reply-toggle" onClick={() => toggleReply(index)}>
                        {res.isReplyOpen ? 'Скрыть ответ' : 'Написать ответ'}
                      </button>
                      <div className={`reply-container ${res.isReplyOpen ? 'open' : ''}`}>
                        <textarea
                          className="reply-textarea"
                          placeholder="Напишите ваш ответ здесь..."
                          onChange={(e) => handleReplyToResponse(res.id, e.target.value)}
                        />
                        <button className="reply-button" onClick={() => handleReplyToResponse(res.id, response)}>Ответить</button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Нет откликов.</p>
              )}
            </div>
          ) : (
            <div className="response-section">
              {isUserLoggedIn ? (
                userData?.uid !== order.createdBy ? (
                  <div className="response-form">
                    <div className="response-info">
                      <span>Осталось откликов: {remainingResponses}</span>
                    </div>
                    <textarea
                      className="response-textarea"
                      placeholder="Напишите ваш отклик здесь..."
                      value={response}
                      onChange={handleResponseChange}
                    />
                    <button
                      className="response-button"
                      onClick={handleSubmit}
                      disabled={remainingResponses <= 0}
                    >
                      Отправить
                    </button>
                  </div>
                ) : null
              ) : (
                <div className="registration-message">
                  <FaLock className="lock-icon" />
                  <h2>Пожалуйста, зарегистрируйтесь</h2>
                  <p>
                    Для отправки отклика на этот заказ необходимо зарегистрироваться. Пожалуйста,{' '}
                    <a href="/register">зарегистрируйтесь</a> для продолжения.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderDetail;