import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore'; 
import { db } from './firebaseConfig'; 
import './CardPayment.css';

const CardPayment = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();
  const { dealId } = useParams(); // Получаем dealId из параметров

  const handlePayment = async () => {
    if (cardNumber && expiryDate && cvv) {
      setIsPaid(true);
      console.log('Данные карты:', { cardNumber, expiryDate, cvv });
      alert('Средства успешно заморожены!');

      if (!dealId) {
        console.error('dealId is undefined!');
        return; // Если dealId undefined, прерываем выполнение
      }

      try {
        const dealRef = doc(db, 'deals', dealId);
        await updateDoc(dealRef, {
          stage: 'Work',
          paymentStatus: 'paid',
        });
        console.log('Этап сделки обновлен на "Работа" и статус оплаты на "paid"');

        navigate(`/deal/${dealId}/work`); // Перенаправляем на страницу "Работа"
      } catch (error) {
        console.error('Ошибка при обновлении этапа сделки и статуса оплаты:', error);
      }
    } else {
      alert('Заполните все поля для оплаты!');
    }
  };

  return (
    <div className="card-payment-container">
      <h1>Оплата картой</h1>
      <div className="card-payment-form">
        <label>
          Номер карты:
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="0000 0000 0000 0000"
          />
        </label>
        <label>
          Срок действия:
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            placeholder="MM/YY"
          />
        </label>
        <label>
          CVV:
          <input
            type="password"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="***"
          />
        </label>
        <button className="pay-button" onClick={handlePayment}>
          Оплатить
        </button>
      </div>
      {isPaid && <p>Оплата произведена. Средства заморожены!</p>}
    </div>
  );
};

export default CardPayment;
