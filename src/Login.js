import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Проверяем, если пользователь уже аутентифицирован
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/main'); // Перенаправляем на главную страницу
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/main');
    } catch (err) {
      console.error('Ошибка входа:', err.message);
      setError('Ошибка входа. Проверьте данные и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Войти</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email"
              />
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
            </div>
          </div>
          <div className="forgot-password">
            <a href="/forgot-password">Забыли пароль?</a>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="register-link">
          <p>Нет аккаунта? <a href="/register">Зарегистрируйтесь</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
