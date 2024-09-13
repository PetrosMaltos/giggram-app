import React, { useState, useEffect } from 'react';
import ProjectCard from './components/ProjectCard';
import './MyProjects.css';

const MyProjects = () => {
  const projects = [
    { id: 1, title: 'Проект 1', description: 'Описание проекта 1', tags: ['тег1', 'тег2'], status: 'В процессе' },
    { id: 2, title: 'Проект 2', description: 'Описание проекта 2', tags: ['тег3', 'тег4'], status: 'Завершен' },
    // Добавьте больше данных проектов
  ];

  useEffect(() => {
    // Настройка кнопки "Назад"
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.BackButton.show();

      const handleBackButtonClick = () => window.history.back();
      window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);

    }

  }, []);

  return (
    <div className="my-projects-page">
      <header>
        <h1>Мои Проекты</h1>
      </header>
      <div className="projects-list">
        {projects.map(project => (
          <ProjectCard 
            key={project.id}
            title={project.title}
            description={project.description}
            tags={project.tags}
            status={project.status}
          />
        ))}
      </div>
    </div>
  );
};

export default MyProjects;
