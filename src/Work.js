// Work.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPaperclip, FaTelegramPlane } from 'react-icons/fa';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useUser } from './UserContext';
import './Work.css';

const Work = () => {
  const { dealId } = useParams(); // Получаем dealId из параметров маршрута
  const { user } = useUser(); // Получаем текущего пользователя из контекста
  const currentStep = 3; // Текущий этап — "Работа"
  const steps = ['Заказ', 'Оплата', 'Работа', 'Отзыв'];
  const [timeLeft, setTimeLeft] = useState('2 дня');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!dealId) {
      console.error('dealId is undefined or null');
      return;
    }

    const q = query(collection(db, 'deals', dealId, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push(doc.data());
      });
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [dealId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await addDoc(collection(db, 'deals', dealId, 'messages'), {
          text: newMessage,
          sender: user ? user.uid : 'unknown', // Используем ID текущего пользователя
          timestamp: new Date()
        });
        setNewMessage('');
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    }
  };

  useEffect(() => {
    if (!dealId) {
      console.error('dealId is undefined or null');
      return;
    }

    const updateDealStage = async () => {
      try {
        await updateDoc(doc(db, 'deals', dealId), { stage: 'Работа' });
      } catch (error) {
        console.error('Ошибка при обновлении этапа сделки:', error);
      }
    };
    updateDealStage();
  }, [dealId]);

  return (
    <div className="work-container">
      <h1 className="main-title">Работа над заказом</h1>
      <div className="steps-nav">
        {steps.map((step, index) => (
          <div key={index} className={`step ${currentStep === index + 1 ? 'active' : ''}`}>
            {step}
          </div>
        ))}
      </div>
      <div className="progress-container">
        <div className="progress-info">Осталось {timeLeft}</div>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
      {/* Чат */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender === (user ? user.uid : 'unknown') ? 'client-message' : 'freelancer-message'}`}>
              <p>{message.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Реф для прокрутки */}
        </div>
        <div className="chat-input-container">
          <button className="upload-button">
            <FaPaperclip className='send-icon' />
          </button>
          <input
            className="chat-input"
            type="text"
            placeholder="Ваше сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="send-button" onClick={handleSendMessage}>
            <FaTelegramPlane className='send-icon' />
          </button>
        </div>
      </div>
      <button className="complete-deal-button">Завершить сделку</button>
    </div>
  );
};

export default Work;