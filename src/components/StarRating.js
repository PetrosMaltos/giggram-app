import React from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, onRatingChange }) => {
  const handleClick = (index) => {
    if (onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div>
      {[...Array(5)].map((star, index) => (
        <FaStar
          key={index}
          size={24}
          color={index < rating ? '#ffc107' : '#e4e5e9'}
          onClick={() => handleClick(index)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </div>
  );
};

export default StarRating;
