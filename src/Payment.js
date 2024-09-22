import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { doc, getDoc } from 'firebase/firestore'; // Импортируем getDoc
import { db } from './firebaseConfig'; // Импортируем конфигурацию Firebase
import './Payment.css'; 
import { FaRegSnowflake } from "react-icons/fa";

const Payment = () => {
  const navigate = useNavigate();
  const { dealId } = useParams(); // Получаем dealId из параметров
  const [dealStage, setDealStage] = useState('');

  useEffect(() => {
    const fetchDealStage = async () => {
      try {
        const dealRef = doc(db, 'deals', dealId);
        const dealSnap = await getDoc(dealRef);

        if (dealSnap.exists()) {
          setDealStage(dealSnap.data().stage); // Получаем этап сделки из Firestore
        } else {
          console.error('Делок не найден');
        }
      } catch (error) {
        console.error('Ошибка при получении этапа сделки:', error);
      }
    };

    fetchDealStage();
  }, [dealId]);

  // Проверяем этап сделки
  useEffect(() => {
    if (dealStage === 'Work') {
      navigate(`/deal/${dealId}/work`); // Перенаправляем на страницу "Работа", если этап "Работа"
    }
  }, [dealStage, dealId, navigate]);

  const dealInfo = {
    title: 'Название заказа',
    price: '1000$',
    customer: 'Иван Иванов',
    performer: 'Алексей Петров',
    deadlines: '10 дней',
  };

  const handleFreezeClick = () => {
    navigate(`/deal/${dealId}/card-payment`); // Перенаправление на страницу оплаты картой
  };

  return (
    <div className="payment-container">
      <h1 className="main-title">Оплата заказа</h1>

      <div className="steps-nav">
        <div className="step">Заказ</div>
        <div className="step active">Оплата</div>
        <div className="step">Работа</div>
        <div className="step">Отзыв</div>
      </div>

      <div className="block-payment">
        <h2>Оплата</h2>
        <p>Для начала сделки заморозьте средства. Это обеспечит безопасность и подтверждение вашего намерения.</p>
      </div>

      <div className="deal-info">
        <h2>Название заказа</h2>
        <p>Цена: {dealInfo.price}</p>
        <p>Заказчик: {dealInfo.customer}</p>
        <p>Исполнитель: {dealInfo.performer}</p>
        <p>Сроки: {dealInfo.deadlines}</p>
      </div>

      <div className="start-button-container">
        <button className='start-button' onClick={handleFreezeClick}>
          Заморозить средства
          <FaRegSnowflake className='snowflake-icon' />
        </button>
      </div>
    </div>
  );
};

export default Payment;
