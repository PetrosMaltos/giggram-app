import React from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate для навигации
import './Payment.css'; // Используем отдельный файл стилей
import { FaRegSnowflake } from "react-icons/fa";


const Payment = () => {
  const navigate = useNavigate(); // Инициализируем useNavigate

  const dealInfo = {
    title: 'Название заказа',
    price: '1000$',
    customer: 'Иван Иванов',
    performer: 'Алексей Петров',
    deadlines: '10 дней',
  };

  const handleFreezeClick = () => {
    // Логика заморозки средств
    console.log('Средства заморожены');
  };

  return (
    <div className="payment-container">
      <h1 className="main-title">Оплата заказа</h1>

      {/* Этапы */}
      <div className="steps-nav">
        <div className="step">Заказ</div>
        <div className="step active">Оплата</div>
        <div className="step">Работа</div>
        <div className="step">Отзыв</div>
      </div>

     {/* Блок "Оплата" */}
<div className="block-payment">
  <h2>Оплата</h2>
  <p>Для начала сделки заморозьте средства. Это обеспечит безопасность и подтверждение вашего намерения.</p>
</div>

      {/* Информация о заказе */}
      <div className="deal-info">
        <h2>Название заказа</h2>
        <p>Цена: {dealInfo.price}</p>
        <p>Заказчик: {dealInfo.customer}</p>
        <p>Исполнитель: {dealInfo.performer}</p>
        <p>Сроки: {dealInfo.deadlines}</p>
      </div>

      {/* Кнопка "Заморозить средства" */}
      <div className="start-button-container">
        <button className="start-button" onClick={handleFreezeClick}>
          Заморозить средства
          <FaRegSnowflake className='snowflake-icon'/>
        </button>
      </div>
    </div>
  );
};

export default Payment;
