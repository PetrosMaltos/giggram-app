import React, { useState } from 'react';
import { FaStar, FaRegStar, FaCheck } from 'react-icons/fa';
import './Review.css';

const Review = () => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [compliments, setCompliments] = useState({
    quality: false,
    communication: false,
    speed: false,
    creativity: false,
    professionalism: false,
  });

  const handleRating = (value) => {
    setRating(value);
  };

  const handleReviewChange = (event) => {
    setReview(event.target.value);
  };

  const handleComplimentChange = (event) => {
    setCompliments({
      ...compliments,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = () => {
    console.log('Rating:', rating);
    console.log('Review:', review);
    console.log('Compliments:', compliments);
  };

  return (
    <div className="review-container">
      <h2 className="review-header">Оставить отзыв</h2>

      {/* Оценка звездочками */}
      <div className="review-rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} className="icon-button" onClick={() => handleRating(value)}>
            {value <= rating ? <FaStar style={{ color: '#FFD700' }} /> : <FaRegStar style={{ color: '#FFD700' }} />}
          </button>
        ))}
      </div>

      {/* Список комплиментов */}
      <div className="compliments-section">
        <h3>Что понравилось?</h3>
        <label>
          <input type="checkbox" name="quality" checked={compliments.quality} onChange={handleComplimentChange} />
          Качественная работа
        </label>
        <label>
          <input type="checkbox" name="communication" checked={compliments.communication} onChange={handleComplimentChange} />
          Отличная коммуникация
        </label>
        <label>
          <input type="checkbox" name="speed" checked={compliments.speed} onChange={handleComplimentChange} />
          Быстрая работа
        </label>
        <label>
          <input type="checkbox" name="creativity" checked={compliments.creativity} onChange={handleComplimentChange} />
          Креативный подход
        </label>
        <label>
          <input type="checkbox" name="professionalism" checked={compliments.professionalism} onChange={handleComplimentChange} />
          Профессионализм
        </label>
      </div>

      {/* Поле ввода для отзыва */}
      <textarea
        className="review-textfield"
        placeholder="Напишите ваш отзыв..."
        value={review}
        onChange={handleReviewChange}
        rows={4}
      />

      {/* Кнопка отправки */}
      <button className="review-submit-button" onClick={handleSubmit}>
        Отправить отзыв <FaCheck className="check-icon" />
      </button>
    </div>
  );
};

export default Review;
