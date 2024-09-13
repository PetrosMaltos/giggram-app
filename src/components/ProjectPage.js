import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AiFillStar } from 'react-icons/ai';
import { FaLock } from 'react-icons/fa';
import ScrollToTop from './ScrollToTop';
import { db, doc, getDoc } from '../firebaseConfig'; // Предположим, что конфигурация Firebase импортирована здесь
import './ProjectPage.css';
import Loading from './Loading';

const ProjectPage = ({ isAuthenticated }) => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, 'projects', id);
        const projectDoc = await getDoc(projectRef);

        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() });
        } else {
          setError('Проект не найден');
        }
      } catch (err) {
        setError('Ошибка при загрузке проекта');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.BackButton.show();

      const handleBackButtonClick = () => window.history.back();
      window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);

      return () => {
        window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
        window.Telegram.WebApp.BackButton.hide();
      };
    }

    return () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.hide();
      }
    };
  }, []);

  const handleResponseChange = (e) => {
    setResponse(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Комментарий отправлен:', response);
  };

  if (loading) {
    return <Loading />;  // Здесь должно быть возвращение компонента Loading
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="project-detail">
      <ScrollToTop />
      <div className="project-info">
        {project?.image && (  // Проверка на существование project и project.image
          <div className="project-image1">
            <img src={project.image} alt={project.title || 'Проект'} /> 
          </div>
        )}
        <div className="client-profile">
          <div className="client-avatar" />
          <div className="client-info">
            <div className="client-name">Имя клиента</div>
            <div className="client-reviews">
              <AiFillStar className="star-rating" />
              <span>4.4</span>
            </div>
          </div>
        </div>
        <h1 className="project-title">{project?.title || 'Название проекта'}</h1> 
        <p className="project-description">{project?.description || 'Описание отсутствует'}</p>
        <div className="project-tags">
          {project?.tags && project.tags.length > 0 ? (
            <div className="tags">
              {project.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          ) : (
            <p>Теги отсутствуют</p>
          )}
        </div>
      </div>
      <div className="divider" />
      <div className="response-section">
        {isAuthenticated ? (
          <div className="response-form">
            <textarea
              className="response-textarea"
              placeholder="Напишите ваш комментарий здесь..."
              value={response}
              onChange={handleResponseChange}
            />
            <button className="response-button" onClick={handleSubmit}>Отправить Комментарий</button>
          </div>
        ) : (
          <div className="registration-message">
            <FaLock className="lock-icon" />
            <h2>Пожалуйста, зарегистрируйтесь</h2>
            <p>Для того чтобы комментировать этот проект необходимо зарегистрироваться. Пожалуйста, <a href="/register">зарегистрируйтесь</a> для продолжения.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
