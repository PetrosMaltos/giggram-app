import React from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaPalette, FaBook } from 'react-icons/fa'; // Импорт иконок
import './Categories.css'; // Импорт стилей

const CategoriesPage = () => {
  return (
    <div className="categories-page">
      <div className="categories-list">
        <div className="category-card">
          <div className="category-icon"><FaCode /></div>
          <div className="category-content">
            <h2>Веб-разработка</h2>
            <p>Найдите экспертов для создания веб-сайтов и веб-приложений.</p>
          </div>
        </div>
        <div className="category-card">
          <div className="category-icon"><FaPalette /></div>
          <div className="category-content">
            <h2>Графический Дизайн</h2>
            <p>Найдите дизайнеров для логотипов, баннеров и других графических материалов.</p>
          </div>
        </div>
        <div to="/orders" className="category-card">
          <div className="category-icon"><FaBook /></div>
          <div className="category-content">
            <h2>Письмо и Перевод</h2>
            <p>Получите помощь в создании контента и переводах.</p>
          </div>
        </div>
        {/* Добавьте больше категорий по мере необходимости */}
      </div>
    </div>
  );
};

export default CategoriesPage;
