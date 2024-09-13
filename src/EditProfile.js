import React, { useState, useEffect } from 'react'; // Добавлен импорт useEffect
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const EditProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(currentUser.username || '');
  const [description, setDescription] = useState(currentUser.description || '');

  const handleSave = () => {
    // Сохраните обновления в Firebase
    navigate('/profile');
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
      <h2>Редактировать Профиль</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Имя пользователя"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание"
      />
      <button onClick={handleSave}>Сохранить</button>
    </div>
  );
};

export default EditProfile;
