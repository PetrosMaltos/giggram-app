import React, { useState, useEffect } from 'react';
import './Settings.css';
import Navbar from './components/Navbar';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebaseConfig';

const Settings = () => {
  const [theme, setTheme] = useState('dark');
  const [openSection, setOpenSection] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [newAvatar, setNewAvatar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAvatar = async () => {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        setAvatar(userSnap.data().avatar || '');
      }
    };

    fetchUserAvatar();
  }, []);

  const handleThemeChange = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const toggleSection = (section) => {
    setOpenSection(prevSection => prevSection === section ? null : section);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе из аккаунта:', error);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const newAvatar = await getDownloadURL(storageRef);

      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDoc, { avatar: newAvatar });

      setAvatar(newAvatar);
    }
  };

  const ChoosePlan = () => {
    navigate('/subscribe');
  };

  return (
    <div className={`settings-container ${theme}`}>
      <Navbar />
      <h1 className="settings-title">Настройки</h1>
      <div className={`settings-section ${openSection === 'account' ? 'open' : ''}`}>
        <h2 className="section-title" onClick={() => toggleSection('account')}>Аккаунт</h2>
        <div className="settings-content">
        <div className="avatar-container" onClick={() => document.getElementById('avatar-upload').click()}>
          <input
            type="file"
            id="avatar-upload"
            className="avatar-upload"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          <div className="avatar">
            <img src={avatar} alt="User Avatar" className="avatar-image" />
            <div className="avatar-overlay">
              <span className="overlay-text">Изменить аватарку</span>
            </div>
          </div>
        </div>
          <div className="setting-item">
            <span className="setting-label">Профиль</span>
            <button className="setting-button">Редактировать профиль</button>
          </div>
          <div className="setting-item">
            <span className="setting-label">Безопасность</span>
            <button className="setting-button">Изменить пароль</button>
          </div>
          <div className="setting-item">
            <span className="setting-label">Выйти из аккаунта</span>
            <button className="logout-button" onClick={handleLogout}>Выйти</button>
          </div>
        </div>
      </div>
      <div className={`settings-section ${openSection === 'notifications' ? 'open' : ''}`}>
        <h2 className="section-title" onClick={() => toggleSection('notifications')}>Уведомления</h2>
        <div className="settings-content">
          <div className="setting-item">
            <span className="setting-label">Push-уведомления</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span className="setting-label">Email-уведомления</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
      <div className={`settings-section ${openSection === 'privacy' ? 'open' : ''}`}>
        <h2 className="section-title" onClick={() => toggleSection('privacy')}>Конфиденциальность</h2>
        <div className="settings-content">
          <div className="setting-item">
            <span className="setting-label">Показывать статус онлайн</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
      <div className={`settings-section ${openSection === 'subscription' ? 'open' : ''}`}>
        <h2 className="section-title" onClick={() => toggleSection('subscription')}>Подписка</h2>
        <div className="settings-content">
          <div className="setting-item">
            <span className="setting-label">Текущий план</span>
            <span className="setting-value">Бесплатный</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Обновить</span>
            <button className="setting-button" onClick={ChoosePlan}>Выбрать план</button>
          </div>
        </div>
      </div>
      <div className={`settings-section ${openSection === 'theme' ? 'open' : ''}`}>
        <h2 className="section-title" onClick={() => toggleSection('theme')}>Тема</h2>
        <div className="settings-content">
          <div className="setting-item">
            <span className="setting-label">Тёмный режим</span>
            <label className="switch">
              <input type="checkbox" checked={theme === 'dark'} onChange={handleThemeChange} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
