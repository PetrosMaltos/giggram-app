import React from 'react';
import { Link } from 'react-router-dom'; // Используйте, если вы используете React Router
import './NotFound.css';

const NotFound = () => {
  return (
    <div id="oopss">
      <div id="error-text">
        <img 
          src="https://cdn.rawgit.com/ahmedhosna95/upload/1731955f/sad404.svg" 
          alt="404"
        />
        <span>404 PAGE</span>
        <Link to='/main' className="back">На главную</Link>
      </div>
    </div>
  );
};

export default NotFound;
