import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import './DealDetail.css';
import { FaArrowRight } from "react-icons/fa";

const DealDetail = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dealInfo, setDealInfo] = useState({});
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [timer, setTimer] = useState(30);
  const { dealId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const dealRef = doc(db, 'deals', dealId);

    const unsubscribe = onSnapshot(dealRef, (dealSnap) => {
      if (dealSnap.exists()) {
        const dealData = dealSnap.data();
        setDealInfo(dealData);

        // Устанавливаем этап и перенаправляем, если необходимо
        if (dealData.stage === 'Оплата') {
          setCurrentStep(2);
          navigate(`/deal/${dealId}/payment`); // Перенаправляем на этап "Оплата"
        } else {
          setCurrentStep(1);
        }
      } else {
        console.error('Сделка не найдена');
      }
    });

    return () => unsubscribe(); // Отписка при размонтировании
  }, [dealId, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setButtonDisabled(false);
    }
  }, [timer]);

  const handleStartClick = async () => {
    try {
      await updateDoc(doc(db, 'deals', dealId), { stage: 'Оплата' });
      setCurrentStep(2);
      navigate(`/deal/${dealId}/payment`); // Перенаправляем после изменения этапа
    } catch (error) {
      console.error('Ошибка при обновлении этапа сделки:', error);
    }
  };

  const steps = ['Заказ', 'Оплата', 'Работа', 'Отзыв'];

  const commission = 0.1;
  const rewardWithCommission = (dealInfo.reward * (1 - commission)).toFixed(2);

  const requirements = "Требования к заказу: Необходимо разработать дизайн для веб-приложения с учетом всех современных тенденций. Важно учитывать пользовательский опыт и сделать интерфейс интуитивно понятным.";

  const files = [
    { name: 'Дизайн-макет.pdf', url: '#' },
    { name: 'Техническое задание.docx', url: '#' },
  ];

  return (
    <div className="deal-container">
      <h1 className="main-title">Детали сделки {dealInfo.title}</h1>

      {/* Этапы */}
      <div className="steps-nav">
        {steps.map((step, index) => (
          <div key={index} className={`step ${currentStep === index + 1 ? 'active' : ''}`}>
            {step}
          </div>
        ))}
      </div>

      {/* Информационный блок */}
      <div className="deal-info">
        <h2 className="deal-title">Информация о заказе</h2>
        <div className="deal-details">
          <div className="detail-item">
            <span className="detail-label">Цена:</span> {dealInfo.price}
          </div>
          <div className="detail-item">
            <span className="detail-label">Заказчик:</span> {dealInfo.customer}
          </div>
          <div className="detail-item">
            <span className="detail-label">Исполнитель:</span> {dealInfo.performer}
          </div>
          <div className="detail-item">
            <span className="detail-label">Сроки:</span> {dealInfo.deadlines}
          </div>
          <div className="detail-item">
            <span className="detail-label">Вознаграждение:</span> 
            <span className="reward-amount"> {rewardWithCommission} ₽</span>
          </div>
        </div>
      </div>

      {/* Описание заказа */}
      <div className="deal-requirements">
        <h2 className="requirements-title">Описание заказа</h2>
        <p className="requirements-text">{requirements}</p>
      </div>

      {/* Прикрепленные файлы */}
      <div className="files">
        <h2 className="files-title">Прикрепленные файлы</h2>
        <ul className="files-list">
          {files.map((file, index) => (
            <li key={index}>
              <a href={file.url} className="file-link">{file.name}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Кнопка Приступить */}
      <div className="start-button-container">
        <button 
          className="start-button"
          disabled={buttonDisabled} 
          onClick={handleStartClick} 
        >
          {buttonDisabled ? `Приступить (${timer} сек)` : 'Приступить'}
          <FaArrowRight 
            style={{ 
              width: '18px', 
              height: '18px', 
              marginLeft: '10px', 
              verticalAlign: 'middle' 
            }} 
          />
        </button>
      </div>
    </div>
  );
};

export default DealDetail;
