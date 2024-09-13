import React from 'react';
import './Loading.css'; // Импортируем стили для страницы загрузки

const Loading = () => {
  return (
    <div className="loading-screen">
      <div className="loader"></div>
    </div>
  );
};

export default Loading;
