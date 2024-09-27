import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from './firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import './MyDeals.css';

const MyDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserRole(userData.role);

            // Массив для хранения условий фильтрации
            let conditions = [];

            if (userData.role === 'freelancer') {
              conditions.push(where('freelancerId', '==', user.uid));
            } else if (userData.role === 'client') {
              conditions.push(where('clientId', '==', user.uid));
            } else if (userData.role === 'admin') {
              // Если модератор, отображаем все сделки
              // Если нужно, добавьте дополнительные условия
            } else {
              console.error('Неизвестная роль пользователя');
              return;
            }

            const q = query(collection(db, 'deals'), ...conditions);
            const querySnapshot = await getDocs(q);
            const dealsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Удаляем сделки, у которых stage завершено
            const filteredDeals = [];
            for (const deal of dealsData) {
              if (deal.stage === 'Завершено') {
                await deleteDoc(doc(db, 'deals', deal.id));
              } else {
                filteredDeals.push(deal);
              }
            }

            setDeals(filteredDeals);
            console.log('Загруженные сделки:', filteredDeals); // Добавляем лог для отладки
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке сделок:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
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

  if (loading) {
    return <div className="loading">Загрузка сделок...</div>;
  }

  if (deals.length === 0) {
    return <div className="no-deals">Нет доступных сделок.</div>;
  }

  return (
    <div className="my-deals-page">
      <h1>Сделки</h1>
      <div className="deals-list">
        {deals.map((deal) => (
          <Link to={`/deal/${deal.id}`} key={deal.id} className="deal-item">
            <h2>{deal.projectTitle}</h2>
            <p>Этап: {deal.stage || 'Не указан'}</p>
            <p>Цена: {deal.price} руб.</p>
            <p>Статус: {deal.status === 'Завершено' ? 'Завершена' : 'В процессе'}</p>
            <p>Оплата: {deal.paymentStatus === 'frozen' ? 'Заморожена' : 'Ожидание'}</p>
            <p>Контрагент: {deal.counterparty}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyDeals;