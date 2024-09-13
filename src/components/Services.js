import React, { useEffect } from 'react';
import { FaDollarSign, FaStar, FaArchive } from 'react-icons/fa';
import { IoDiamond } from 'react-icons/io5';
import './Services.css'; // Импорт стилей

const Services = () => {
  const services = [
    {
      title: 'Бесплатные заказы',
      description: 'Размещайте заказы бесплатно и находите исполнителей без затрат.',
      icon: <FaDollarSign />,
    },
    {
      title: '5 бесплатных откликов в день',
      description: 'Фрилансеры могут бесплатно откликаться на 5 заказов в день.',
      icon: <FaStar />,
    },
    {
      title: 'Автоматическое архивирование',
      description: 'Заказы архивируются автоматически после истечения срока.',
      icon: <FaArchive />,
    },
  ];

  useEffect(() => {
    // Функция для создания частиц
    const createParticles = () => {
      const container = document.querySelector('.icon-particles');
      const numParticles = 30;

      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        container.appendChild(particle);

        // Устанавливаем случайные значения для переменных CSS
        const x = Math.random() * 300 - 150; // Random value between -150 and 150
        const y = Math.random() * 300 - 150; // Random value between -150 and 150
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        
        // Удаляем частицу после окончания анимации
        particle.addEventListener('animationend', () => {
          particle.remove();
        });
      }
    };

    createParticles();
  }, []);

  return (
    <div className="services-page">
      <div className="services-list">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <div className="service-icon">{service.icon}</div>
            <div className="service-content">
              <h2>{service.title}</h2>
              <p>{service.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="subscription-banner">
        <div className="subscription-content">
          <div className="subscription-icon">
            <IoDiamond />
            <div className="icon-particles"></div>
          </div>
          <h2>UnlimitPro</h2>
          <p>Снимите лимиты на отклики и взаимодействуйте с фрилансерами без ограничений. Увеличьте охват и вовлеченность прямо сейчас!</p>
          <a href="/subscribe" className="subscribe-button">Оформить подписку</a>
        </div>
      </div>
    </div>
  );
};

export default Services;
