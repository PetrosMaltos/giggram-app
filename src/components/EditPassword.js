import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './EditPassword.css';

const EditPassword = () => {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async () => {
    if (!currentUser) return;

    try {
      // Создаем учетные данные для текущего пользователя
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      
      // Переаутентификация текущего пользователя
      await reauthenticateWithCredential(currentUser, credential);
      
      // Обновляем пароль
      await updatePassword(currentUser, newPassword);
      
      setSuccess('Пароль успешно обновлен.');
      setError('');
    } catch (err) {
      setError('Ошибка при обновлении пароля. Пожалуйста, попробуйте снова.');
      setSuccess('');
      console.error('Ошибка при обновлении пароля:', err);
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
    <div className="edit-password-page">
      <div className="edit-password-content">
        <h2 className="edit-password-heading">Смена пароля</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="form-group animated-input">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Текущий пароль"
          />
          <span className="underline"></span>
        </div>
        <div className="form-group animated-input">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Новый пароль"
          />
          <span className="underline"></span>
        </div>
        <div className="form-buttons">
          <button className="primary" onClick={handlePasswordChange}>Обновить</button>
        </div>
      </div>
    </div>
  );
};

export default EditPassword;
