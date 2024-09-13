import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './MyResponses.css';

const MyResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResponses = async () => {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error('Пользователь не авторизован');
        setLoading(false);
        return;
      }

      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const userResponses = [];

        ordersSnapshot.forEach((orderDoc) => {
          const orderData = orderDoc.data();

          if (orderData.responses && orderData.responses.length > 0) {
            orderData.responses.forEach((response) => {
              if (response.userId === userId) {
                userResponses.push({
                  orderId: orderDoc.id, // Добавляем идентификатор заказа
                  projectName: orderData.title,
                  responseText: response.text,
                  date: response.createdAt.toDate(),
                });
              }
            });
          }
        });

        setResponses(userResponses);
      } catch (error) {
        console.error('Ошибка получения откликов:', error);
        setError('Не удалось загрузить отклики. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

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

  const handleResponseClick = (orderId) => {
    navigate(`/orders/${orderId}`); // Перенаправляем на страницу заказа
  };

  return (
    <div className="my-responses-container">
      <div className="invites-header">
      <h1>Мои отклики</h1>
      </div>
      {loading ? (
        <div className="empty-state">Загрузка...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : responses.length === 0 ? (
        <div className="empty-state">У вас пока нет откликов.</div>
      ) : (
        <ul className="response-list">
        {responses.map((response, index) => (
          <li key={index} className="response-item">
            <p>
              <strong>Заказ:</strong> 
              <a href={`/orders/${response.orderId}`}>{response.projectName}</a>
            </p>
            <p><strong>Отклик:</strong> {response.responseText}</p>
            <p className="response-date"><strong>Дата:</strong> {response.date.toLocaleString()}</p>
          </li>
        ))}
      </ul>
      
      )}
    </div>
  );
};

export default MyResponses;
