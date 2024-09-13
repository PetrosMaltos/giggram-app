import React from 'react';
import { FaStar } from 'react-icons/fa';
import './SpecialistCard.css';

const SpecialistCard = ({ name, category, rating, avatar, description, tags, price }) => {
  return (
    <div className="specialist-card">
      <img src={avatar} alt={`${name}'s avatar`} className="specialist-avatar" />
      <div className="specialist-info">
        <h2 className="specialist-name">{name}</h2>
        <p className="specialist-category">{category}</p>
        <p className="specialist-description">{description}</p>
        <div className="specialist-tags">
          {tags.map((tag, index) => (
            <span key={index} className="specialist-tag">
              #{tag}
            </span>
          ))}
        </div>
        <div className="specialist-rating">
          <FaStar className="star-icon" /> {rating}
        </div>
        <div className="specialist-price">
          {price} руб/час
        </div>
      </div>
    </div>
  );
};

export default SpecialistCard;
  