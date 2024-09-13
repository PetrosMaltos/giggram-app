import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import './CreateProject.css';
import { FaRegClipboard, FaTag, FaDollarSign, FaListUl, FaRegEdit, FaImage } from 'react-icons/fa';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    tags: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Предотвращаем повторное нажатие
    setIsSubmitting(true);

    const { title, description, category, price, tags } = formData;
    const newProject = {
      title,
      description,
      category,
      price: parseFloat(price), // Преобразуем цену в число
      tags: tags.split(',').map((tag) => tag.trim()),
      views: 0,
      responses: 0,
      createdAt: Timestamp.now(), // Записываем текущее время
      image: imagePreview, // Добавляем изображение
    };
    try {
      await addDoc(collection(db, 'projects'), newProject);
      navigate('/projects'); // Перенаправление на страницу заказов
    } catch (error) {
      console.error('Ошибка создания проекта:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Setup "Back" button
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.BackButton.show();
      const handleBackButtonClick = () => window.history.back();
      window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);
      return () => {
        window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
        window.Telegram.WebApp.BackButton.hide();
      };
    }
    return () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.hide();
      }
    };
  }, []);

  return (
    <div className="create-project-page">
      <div className="create-project-container">
        <h1><FaRegClipboard /> Создать новый проект</h1>
        <form onSubmit={handleSubmit} className="create-project-form">
          <label>
            <FaRegEdit /> Заголовок
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
          </label>
          <label>
            <FaListUl /> Описание
            <textarea name="description" value={formData.description} onChange={handleInputChange} required />
          </label>
          <label>
            <FaTag /> Категория
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
          </label>
          <label>
            <FaImage /> Фото проекта
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
          {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Создание...' : 'Создать проект!'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;