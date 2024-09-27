import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTag, FaRubleSign, FaCommentDots, FaCheckCircle } from 'react-icons/fa';
import './FavorCard.css';

const FavorCard = ({ id, title = 'Без названия', tags = [], price = '0', responses = 0, category = 'Без категории', imagePaths = [], userAvatar = 'default-avatar.png', isVerified = false }) => {
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
      <div className="favor-card-header">
        <div className="favor-card-user-info">
          <img src={userAvatar} alt="User Avatar" className="favor-card-user-avatar" />
          {isVerified && <FaCheckCircle className="verified-icon" />}
        </div>
        <h2 className="favor-card-title">{title}</h2>
      </div>
      <div className="favor-card-images">
        {imagePaths.slice(0, 2).map((imagePath, index) => (
          <img key={index} src={imagePath} alt={`Favor ${index + 1}`} className="favor-card-image" />
        ))}
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
      <div className="favor-card-footer">
        <div className="favor-card-footer-item">
          <FaRubleSign className="footer-icon" /> {price}
        </div>
        <div className="favor-card-footer-item">
          <FaCommentDots className="footer-icon" /> {responses} откликов
        </div>
      </div>
    </div>
  );
};

export default FavorCard;
