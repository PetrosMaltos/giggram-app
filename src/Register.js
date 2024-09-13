import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faUserTie } from '@fortawesome/free-solid-svg-icons';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [role, setRole] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const defaultAvatarUrl = "https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png";

  useEffect(() => {
    // Проверяем, если пользователь уже аутентифицирован
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/main'); // Перенаправляем на главную страницу
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const validateTelegramUsername = (username) => {
    return /^@[A-Za-z0-9_]{5,32}$/.test(username);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!role) {
      setErrorMessage('Пожалуйста, выберите роль.');
      return;
    }
    if (!validateTelegramUsername(telegramUsername)) {
      setErrorMessage('Неверный формат @username в Telegram.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        telegramUsername: telegramUsername,
        role: role,
        avatar: defaultAvatarUrl,
        createdAt: new Date()
      });
      navigate('/main');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Этот email уже используется. Пожалуйста, используйте другой email.');
      } else if (error.code === 'permission-denied') {
        setErrorMessage('Недостаточно прав для выполнения этой операции.');
      } else {
        setErrorMessage('Ошибка регистрации: ' + error.message);
      }
      console.error('Ошибка регистрации:', error.message);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2>Регистрация</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Имя пользователя" required />
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input type="text" id="telegramUsername" value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} placeholder="@username в Telegram" required />
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" required />
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faUserTie} className="input-icon" />
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="" disabled>Выберите свою роль</option>
                <option value="freelancer">Фрилансер</option>
                <option value="client">Заказчик</option>
              </select>
            </div>
          </div>
          <button type="submit">Зарегистрироваться</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
        <p>Уже есть аккаунт? <a href="/login">Войти</a></p>
      </div>
    </div>
  );
};

export default Register;
