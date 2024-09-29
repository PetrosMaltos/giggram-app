import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AiFillStar } from 'react-icons/ai';
import { FaDollarSign, FaEye, FaCalendarAlt, FaClock, FaShareAlt } from 'react-icons/fa';
import './FavorDetail.css';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Loading from './Loading';
import { CiShare1 } from "react-icons/ci";

const FavorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [favor, setFavor] = useState(null);
  const [timeAgo, setTimeAgo] = useState('');
  const [creatorData, setCreatorData] = useState(null);

  useEffect(() => {
    const fetchFavor = async () => {
      if (!id) {
        console.error('ID услуги не найден');
        return;
      }
      try {
        const favorRef = doc(db, 'favors', id);
        const favorSnap = await getDoc(favorRef);
        if (favorSnap.exists()) {
          const favorData = favorSnap.data();
          setFavor(favorData);
          let createdAtDate = favorData.createdAt instanceof Date ? favorData.createdAt : favorData.createdAt.toDate();
          const updateTimer = () => {
            setTimeAgo(formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru }));
          };
          updateTimer();
          const timer = setInterval(updateTimer, 60000);
          if (favorData.createdBy) {
            const creatorRef = doc(db, 'users', favorData.createdBy);
            const creatorSnap = await getDoc(creatorRef);
            if (creatorSnap.exists()) {
              setCreatorData(creatorSnap.data());
            }
          }
          return () => clearInterval(timer);
        } else {
          console.error('Услуга не найдена');
        }
      } catch (error) {
        console.error('Ошибка получения данных услуги:', error);
      }
    };
    fetchFavor();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [id, navigate]);

  if (!favor) {
    return <Loading />;
  }

  return (
    <div className="favor-detail">
      <div className="favor-info">
        <div className="header">
          <div className="client-profile">
            <img src={creatorData?.avatar || 'default-avatar.png'} alt="Аватар" className="client-avatar" />
            <div className="client-info">
              <div className="client-name">{creatorData?.username || 'Загружаю...'}</div>
              <div className="client-reviews">
                <AiFillStar className="star-rating" />
                <span>4.4</span>
              </div>
            </div>
          </div>
          <a href={`/favors/${id}`} className="share-icon">
            <CiShare1 />
          </a>
        </div>
        <h1 className="favor-title">{favor.title}</h1>
        <p className="favor-description">{favor.description}</p>
        <div className="favor-details">
          <div className="favor-info-item">
            <FaDollarSign className="favor-icon" />
            <span className="favor-price">{favor.price} руб.</span>
          </div>
          <div className="favor-info-item">
            <FaEye className="favor-icon" />
            <span className="favor-views">{favor.views || 0} просмотров</span>
          </div>
          <div className="favor-info-item">
            <FaClock className="favor-icon" />
            <span className="favor-time">{timeAgo}</span>
          </div>
          <div className="favor-info-item">
            <FaCalendarAlt className="favor-icon" />
            <span className="favor-deadline">Срок выполнения: {favor.deadline}</span>
          </div>
        </div>
        <button className="order-button">Заказать услугу</button>
        <div className="divider" />
      </div>
      <div className="favor-projects-section">
        <h2>Пример работы</h2>
        <div className="favor-projects">
          {favor.projects && favor.projects.map((project, index) => (
            <a key={index} href={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
              <img src={project.imageUrl} alt={`Проект ${index + 1}`} className="favor-project-image" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavorDetail; 