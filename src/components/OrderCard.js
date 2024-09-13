import React, { useState, useEffect } from 'react';
import { FaClock, FaCommentDots, FaEye, FaUserCheck, FaUserTimes, FaRubleSign } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import './OrderCard.css';

const OrderCard = ({ id, title, description, tags = [], createdAt, price, responses = [], views = 0, isAssigned }) => {
  const [timeAgo, setTimeAgo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (createdAt) {
      const createdAtDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);

      console.log('CreatedAtDate:', createdAtDate); // Логирование даты для проверки

      const updateTimeAgo = () => {
        setTimeAgo(formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru }));
      };

      // Обновление времени при загрузке
      updateTimeAgo();

      // Обновляем время каждую секунду
      const timer = setInterval(updateTimeAgo, 1000);

      return () => clearInterval(timer);
    } else {
      console.error('createdAt is undefined');
    }
  }, [createdAt]);

  const handleCardClick = () => {
    if (id) {
      navigate(`/orders/${id}`);
    } else {
      console.error('Order id is missing');
    }
  };

  return (
    <div className="order-card" onClick={handleCardClick}>
      <div className="order-header">
        <div className={`order-status ${isAssigned ? 'assigned' : 'not-assigned'}`}>
          {isAssigned ? <FaUserCheck /> : <FaUserTimes />}
          <span>{isAssigned ? 'Исполнитель выбран' : 'Исполнитель не выбран'}</span>
        </div>
        <h3 className="order-title">{title}</h3>
      </div>
      <p className="order-description">{description}</p>
      <div className="order-info">
        <div className="order-info-item">
          <FaRubleSign className="order-icon" />
          <span className="order-price">{price || '0'} руб.</span>
        </div>
        <div className="order-info-item">
          <FaEye className="order-icon" />
          <span className="order-views">{views || 0} просмотров</span>
        </div>
        <div className="order-info-item">
          <FaClock className="order-icon" />
          <span className="order-time">{timeAgo}</span>
        </div>
        <div className="order-info-item">
          <FaCommentDots className="order-icon" />
          <span className="order-responses">{responses.length || 0} откликов</span>
        </div>
      </div>
      <div className="order-tags">
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <span key={index} className="order-tag"># {tag}</span>
          ))
        ) : (
          <span className="order-tag">Нет тегов</span>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
