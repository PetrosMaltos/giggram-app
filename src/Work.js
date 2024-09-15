import React, { useState, useRef, useEffect } from 'react';
import { FaPaperclip, FaTelegramPlane } from 'react-icons/fa';
import './Work.css';

const Work = ({ dealId }) => {
  const currentStep = 3; // Текущий этап — "Работа"
  const steps = ['Заказ', 'Оплата', 'Работа', 'Отзыв'];
  const [timeLeft, setTimeLeft] = useState('2 дня');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, { text: newMessage, sender: 'client' }]);
      setNewMessage('');
    }
  };

  // Отправляем на сервер текущий этап сделки
  useEffect(() => {
    const updateDealStage = async () => {
      try {
        await fetch('/api/update-deal-stage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dealId, stage: 'Работа' }),
        });
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
          <div
            key={index}
            className={`step ${currentStep === index + 1 ? 'active' : ''}`}
          >
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
            <div
              key={index}
              className={`message ${message.sender === 'client' ? 'client-message' : 'freelancer-message'}`}
            >
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
