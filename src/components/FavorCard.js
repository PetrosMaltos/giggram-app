import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTag, FaRubleSign, FaCommentDots, FaStar } from 'react-icons/fa';
import './FavorCard.css';

const FavorCard = ({ id, title = 'Без названия', description = 'Описание отсутствует', tags = [], price = '0', responses = 0, imagePaths = [], rating = 0, reviewsCount = 0 }) => {
  const navigate = useNavigate();

  const handleFavorClick = () => {
    if (id) {
      navigate(`/favors/${id}`);
    } else {
      console.error('Favor id is missing');
    }
  };

  return (
    <div className="favor-card" onClick={handleFavorClick}>
      <h2 className="favor-card-title">{title}</h2>
      <p className="favor-card-description">{description}</p>
      <div className="favor-card-images">
        {imagePaths.map((imagePath, index) => (
          <img key={index} src={imagePath} alt={`Favor ${index + 1}`} className="favor-card-image" />
        ))}
      </div>
      <div className="favor-card-footer">
        <div className="favor-card-footer-item">
          <FaRubleSign className="footer-icon" /> {price}
        </div>
        <div className="favor-card-footer-item">
          <FaCommentDots className="footer-icon" /> {responses} откликов
        </div>
        <div className="favor-card-footer-item">
          <FaStar className="footer-icon" /> {rating} ({reviewsCount} отзывов)
        </div>
      </div>
      <div className="favor-card-tags">
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <span key={index} className="favor-card-tag">
              <FaTag className="tag-icon" /> #{tag}
            </span>
          ))
        ) : (
          <span className="no-tags">Без хэштегов</span>
        )}
      </div>
    </div>
  );
};

export default FavorCard;