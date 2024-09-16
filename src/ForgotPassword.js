import React, { useState, useEffect } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Ensure firebase is properly configured
import './ForgotPassword.css'; // Custom CSS file

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(30);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsButtonDisabled(true); // Disable button after submission
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Письмо со сбросом пароля успешно отправлено.');
    } catch (err) {
      setError('Не удалось отправить письмо для сброса пароля. Пожалуйста, попробуйте еще раз.');
    }
  };

  useEffect(() => {
    let countdown;
    if (isButtonDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setIsButtonDisabled(false); // Re-enable button
            setTimer(30); // Reset timer for next use
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [isButtonDisabled]);

  return (
    <div className="forgot-password-wrapper">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Сброс пароля</h2>
        <p className="forgot-password-text">
          Введите адрес электронной почты, чтобы получить ссылку для сброса пароля.
        </p>
        <form onSubmit={handleResetPassword} className="forgot-password-form">
          <input
            type="email"
            className="forgot-password-input"
            placeholder="Введите почту"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="forgot-password-submit"
            disabled={isButtonDisabled}
          >
            {isButtonDisabled ? `Отправить ${timer}с` : 'Отправить'}
          </button>
        </form>
        {message && <p className="forgot-password-message success">{message}</p>}
        {error && <p className="forgot-password-message error">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
