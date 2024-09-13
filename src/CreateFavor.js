import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from './firebaseConfig'; // Импортируйте ваши конфигурации
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaRegClipboard, FaTag, FaDollarSign, FaListUl, FaRegEdit, FaUpload } from 'react-icons/fa';

const CreateFavor = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    tags: '',
    image1: null,
    image2: null,
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, price, tags, image1, image2 } = formData;
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
  
    const newFavor = {
      title,
      description,
      category,
      price: parseFloat(price),
      tags: tagsArray.length > 0 ? tagsArray : ['Без тэгов'],
      views: 0,
      responses: 0,
      createdAt: Timestamp.now(),
      imagePaths: [],
    };
  
    try {
      if (image1) {
        const image1Ref = ref(storage, `images/${image1.name}`);
        await uploadBytes(image1Ref, image1);
        const image1URL = await getDownloadURL(image1Ref);
        newFavor.imagePaths.push(image1URL);
      }
      if (image2) {
        const image2Ref = ref(storage, `images/${image2.name}`);
        await uploadBytes(image2Ref, image2);
        const image2URL = await getDownloadURL(image2Ref);
        newFavor.imagePaths.push(image2URL);
      }
  
      await addDoc(collection(db, 'favors'), newFavor);
      navigate('/favors');
    } catch (error) {
      console.error('Ошибка создания услуги:', error);
    }
  };
  

  useEffect(() => {
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
    <div className="create-order-page">
      <div className="create-order-container">
        <h1><FaRegClipboard /> Создать новую услугу</h1>
        <form onSubmit={handleSubmit} className="create-order-form">
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
            <FaDollarSign /> Цена
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
          </label>
          <label>
            <FaTag /> Хэштеги (через запятую)
            <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} />
          </label>
          <label>
            <FaUpload /> Изображение 1
            <input type="file" name="image1" onChange={handleInputChange} />
          </label>
          <label>
            <FaUpload /> Изображение 2
            <input type="file" name="image2" onChange={handleInputChange} />
          </label>
          <button type="submit" className="submit-button">Создать услугу!</button>
        </form>
      </div>
    </div>
  );
};

export default CreateFavor;
