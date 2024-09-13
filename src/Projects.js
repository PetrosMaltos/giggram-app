import React, { useState, useEffect } from 'react';
import ProjectCard from './components/ProjectCard';
import { FaSearch, FaPlus } from 'react-icons/fa';
import Navbar from './components/Navbar';
import { db, collection, onSnapshot } from './firebaseConfig';
import './Projects.css';

const Projects = () => {
  const [projectsData, setProjectsData] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projects = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        };
      });
      const sortedProjects = projects.sort((a, b) => b.createdAt - a.createdAt);
      setProjectsData(sortedProjects);
      setFilteredProjects(sortedProjects);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterProjects(searchText);
  }, [searchText, projectsData]);

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
  };

  const filterProjects = (searchText) => {
    const lowerSearchText = searchText.toLowerCase();
    const newFilteredProjects = projectsData.filter(project => {
      return project.title.toLowerCase().includes(lowerSearchText) ||
             project.description.toLowerCase().includes(lowerSearchText);
    });
    setFilteredProjects(newFilteredProjects);
  };

  const handleCreateProjectClick = () => {
    window.location.href = '/create-project';
  };

  const defaultImage = 'https://via.placeholder.com/150';

  return (
    <div className="projects-page">
      <Navbar />
      <header className="projects-header">
        <h1>Проекты</h1>
      </header>
      <section className="search-section3">
        <input
          type="text"
          placeholder="Поиск проектов..."
          className="search-input"
          value={searchText}
          onChange={handleInputChange}
        />
        <button className="search-button" onClick={() => filterProjects(searchText)}>
          <FaSearch className="search-icon" />
        </button>
      </section>
      <div className='create-project-button-container'>
        <button className="create-project-button" onClick={handleCreateProjectClick}>
          <FaPlus className="create-project-icon" /> Создать проект
        </button>
      </div>
      <section className="projects-list">
        {filteredProjects.map(project => (
          <div key={project.id} style={{ textDecoration: 'none' }}>
            <ProjectCard
              id={project.id}
              title={project.title}
              image={project.image || defaultImage}
              authorName={project.authorName}
              authorAvatar={project.authorAvatar}
              description={project.description}
            />
          </div>
        ))}
      </section>
    </div>
  );
};

export default Projects;