import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './CreateOrder.css';
import { FaRegClipboard, FaTag, FaDollarSign, FaListUl, FaRegEdit, FaClock } from 'react-icons/fa';

const categories = [
  'Веб-дизайн',
  'Разработка сайтов',
  'Графический дизайн',
  'Копирайтинг',
  'Маркетинг',
  'SEO-оптимизация',
  'Разработка приложений',
  'Переводы'
];

const timeOptions = [
  { label: '1 час', value: 1 },
  { label: '12 часов', value: 12 },
  { label: '24 часа', value: 24 },
  { label: '3 дня', value: 72 },
  { label: 'Неделя', value: 168 },
  { label: 'Месяц', value: 720 },
];

const CreateOrder = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    tags: '',
    activeTime: '', // новое поле для выбора времени
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const auth = getAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, price, tags, activeTime } = formData;

    if (!title || !description || !category || !price || isNaN(price) || parseFloat(price) <= 0 || !activeTime) {
      setError('Пожалуйста, заполните все поля корректно.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
      return;
    }

    const newOrder = {
      title,
      description,
      category,
      price: parseFloat(price),
      tags: tags.split(',').map(tag => tag.trim()),
      views: 0,
      responses: [],
      createdAt: Timestamp.now(),
      activeTime: parseInt(activeTime), // сохраняем активное время в часах
      createdBy: user.uid,
    };

    try {
      await addDoc(collection(db, 'orders'), newOrder);
      setSuccess('Заказ успешно создан!');
      setTimeout(() => navigate('/orders'), 1500);
    } catch (error) {
      setError('Ошибка создания заказа. Попробуйте еще раз.');
      console.error('Ошибка создания заказа:', error);
    }
  };

  return (
    <div className="create-order-page">
      <div className="create-order-container">
        <h1><FaRegClipboard /> Создать новый заказ</h1>
        <form onSubmit={handleSubmit} className="create-order-form">
          <label>
            <FaRegEdit /> Заголовок
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            <FaListUl /> Описание
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            <FaTag /> Категория
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="category-select"
            >
              <option value="" disabled>Выберите категорию</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            <FaDollarSign /> Цена
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
            />
          </label>
          <label>
            <FaTag /> Хэштеги (через запятую)
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
            />
          </label>

          {/* Новый элемент выбора времени активности */}
          <label>
            <FaClock /> Время активности заказа
            <select
              name="activeTime"
              value={formData.activeTime}
              onChange={handleInputChange}
              required
              className="category-select"
            >
              <option value="" disabled>Выберите время активности</option>
              {timeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" className="submit-button">Создать заказ!</button>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
