import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaRegClipboard, FaTag, FaDollarSign, FaListUl, FaRegEdit, FaCalendarAlt } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid'; // Импортируем uuid для генерации уникальных имен файлов

const CreateFavor = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    tags: '',
    deadlineValue: '',
    deadlineUnit: 'дней',
    projects: [{ projectUrl: '', imageUrl: '' }],
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProjects = formData.projects.map((project, i) => 
      i === index ? { ...project, [name]: value } : project
    );
    setFormData(prev => ({ ...prev, projects: updatedProjects }));
  };

  const addProjectField = () => {
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { projectUrl: '', imageUrl: '' }] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, price, tags, deadlineValue, deadlineUnit, projects } = formData;
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
      deadline: `${deadlineValue} ${deadlineUnit}`,
      projects,
      status: 'pending',
      createdBy: user.uid,
    };

    try {
      await addDoc(collection(db, 'favors'), newFavor);
      navigate('/favors');
    } catch (error) {
      console.error('Ошибка создания услуги:', error);
    }
  };

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
            <FaCalendarAlt /> Срок выполнения
            <div className="deadline-inputs">
              <input type="number" name="deadlineValue" value={formData.deadlineValue} onChange={handleInputChange} required />
              <select name="deadlineUnit" value={formData.deadlineUnit} onChange={handleInputChange} required>
                <option value="часов">часов</option>
                <option value="дней">дней</option>
                <option value="недель">недель</option>
                <option value="месяцев">месяцев</option>
              </select>
            </div>
          </label>
          <div>
            <h3>Примеры работ</h3>
            {formData.projects.map((project, index) => (
              <div key={index} className="project-field">
                <label>
                  URL проекта
                  <input
                    type="text"
                    name="projectUrl"
                    value={project.projectUrl}
                    onChange={(e) => handleProjectChange(index, e)}
                    required
                  />
                </label>
                <label>
                  URL изображения
                  <input
                    type="text"
                    name="imageUrl"
                    value={project.imageUrl}
                    onChange={(e) => handleProjectChange(index, e)}
                    required
                  />
                </label>
              </div>
            ))}
            <button type="button" onClick={addProjectField}>Добавить проект</button>
          </div>
          <button type="submit" className="submit-button">Создать услугу!</button>
        </form>
      </div>
    </div>
  );
};

export default CreateFavor;