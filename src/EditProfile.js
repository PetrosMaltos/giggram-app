import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './EditProfile.css';

const EditProfile = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [description, setDescription] = useState(user?.description || '');
  const [telegramUsernameHandle, setTelegramUsernameHandle] = useState(user?.telegramUsername || '');
  const [email, setEmail] = useState(user?.email || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [hashtags, setHashtags] = useState(user?.hashtags || '');
  const [role, setRole] = useState(user?.role || 'freelancer'); // Инициализация роли

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role || 'freelancer'); // Устанавливаем роль из БД
        }
      } catch (error) {
        console.error('Ошибка при получении роли:', error);
      }
    };

    fetchUserRole();
  }, [user]);

  const handleSave = async () => {
    const updatedData = {
      username,
      description,
      telegramUsername: telegramUsernameHandle,
      email,
      skills,
      hashtags,
      role,
    };

    // Проверяем, изменились ли данные
    const isDataChanged = 
      updatedData.username !== user.username ||
      updatedData.description !== user.description ||
      updatedData.telegramUsername !== user.telegramUsername ||
      updatedData.email !== user.email ||
      JSON.stringify(updatedData.skills) !== JSON.stringify(user.skills) ||
      updatedData.hashtags !== user.hashtags ||
      updatedData.role !== user.role;

    if (!isDataChanged) {
      console.log('Нет изменений для сохранения.');
      return; // Если данных нет для изменения, ничего не делаем
    }

    try {
      // Обновление данных в Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updatedData);

      // Обновление данных в контексте или глобальном состоянии
      await updateUser(updatedData);

      navigate('/profile');
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
    }
  };

  const handleAddSkill = () => {
    setSkills([...skills, '']);
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = skills.map((skill, i) => (i === index ? value : skill));
    setSkills(updatedSkills);
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
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
    <div className="edit-profile-page">
      <div className="edit-profile-content">
      <h2 className="edit-profile-heading">Редактировать</h2>
        <div className="form-group animated-input">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Имя пользователя"
          />
          <span className="underline"></span>
        </div>
        <div className="form-group animated-input">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
          />
          <span className="underline"></span>
        </div>
        <div className="form-group animated-input">
          <input
            type="text"
            value={telegramUsernameHandle}
            onChange={(e) => setTelegramUsernameHandle(e.target.value)}
            placeholder="Ваш Telegram"
          />
          <span className="underline"></span>
        </div>
        <div className="form-group animated-input">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ваш Email"
          />
          <span className="underline"></span>
        </div>
        <div className="form-group animated-input">
          <label>Роль</label>
          <div className="role-select">
            <button
              className={`role-option ${role === 'freelancer' ? 'active' : ''}`}
              onClick={() => setRole('freelancer')}
            >
              Фрилансер
            </button>
            <button
              className={`role-option ${role === 'client' ? 'active' : ''}`}
              onClick={() => setRole('client')}
            >
              Заказчик
            </button>
          </div>
        </div>
        <div className="form-group skills-block">
          <label>Навыки</label>
          <div className="skills-container">
            {skills.map((skill, index) => (
              <div key={index} className="skill-item">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  placeholder="Добавьте навык"
                />
                <button type="button" className="remove-btn" onClick={() => handleRemoveSkill(index)}>
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="add-skill-btn" onClick={handleAddSkill}>Добавить навык</button>
          </div>
        </div>
        <div className="form-group animated-input">
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#хештеги"
          />
          <span className="underline"></span>
        </div>
        <div className="form-buttons">
          <button className="primary" onClick={handleSave}>Сохранить</button>
          <button className="secondary" onClick={() => navigate('/profile')}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
