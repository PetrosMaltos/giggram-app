import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaCheck } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { addDoc, collection, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './Review.css';

const Review = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [compliments, setCompliments] = useState({
    quality: false,
    communication: false,
    speed: false,
    creativity: false,
    professionalism: false,
  });
  const [dealData, setDealData] = useState(null);

  useEffect(() => {
    const fetchDealData = async () => {
      const dealDoc = await getDoc(doc(db, 'deals', dealId));
      if (dealDoc.exists()) {
        const data = dealDoc.data();
        setDealData(data);
        if (data.stage !== 'Отзыв') {
          navigate(`/deal/${dealId}/${data.stage.toLowerCase()}`);
        }
      }
    };
    fetchDealData();
  }, [dealId, navigate]);

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

  const handleSubmit = async () => {
    try {
      const reviewData = {
        rating,
        review,
        compliments,
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'deals', dealId, 'reviews'), reviewData);
      await updateDoc(doc(db, 'deals', dealId), { stage: 'Завершено' });

      navigate('/main'); // Перенаправление на главную страницу или другую страницу после отправки отзыва
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await updateDoc(doc(db, 'deals', dealId), { stage: 'Завершено' });
      navigate('/main'); // Перенаправление на главную страницу или другую страницу после пропуска отзыва
    } catch (error) {
      console.error('Ошибка при пропуске отзыва:', error);
    }
  };

  return (
    <div className="review-container">
      <h2 className="review-header">Оставить отзыв</h2>

      <div className="review-rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} className="icon-button" onClick={() => handleRating(value)}>
            {value <= rating ? <FaStar style={{ color: '#FFD700' }} /> : <FaRegStar style={{ color: '#FFD700' }} />}
          </button>
        ))}
      </div>

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

      <textarea
        className="review-textfield"
        placeholder="Напишите ваш отзыв..."
        value={review}
        onChange={handleReviewChange}
        rows={4}
      />

      <div className="review-buttons">
        <button className="review-submit-button" onClick={handleSubmit}>
          Отправить отзыв <FaCheck className="check-icon" />
        </button>
        <button className="review-skip-button" onClick={handleSkip}>
          Пропустить
        </button>
      </div>
    </div>
  );
};

export default Review;