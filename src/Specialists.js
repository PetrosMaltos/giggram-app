import React from 'react';
import SpecialistCard from './components/SpecialistCard';
import Navbar from './components/Navbar';
import Filters from './components/Filters'; // Импортируйте компонент фильтров
import { FaSearch } from 'react-icons/fa';
import './Specialists.css';

const specialistsData = [
  {
    id: 1,
    name: 'Александр Петров',
    category: 'Веб-разработка',
    rating: 4.8,
    avatar: 'path/to/avatar1.jpg',
    description: 'Опытный разработчик с многолетним стажем в веб-разработке.',
    tags: ['JavaScript', 'React', 'Node.js'],
    price: 1000, // Цена за час
  },
  {
    id: 2,
    name: 'Елена Смирнова',
    category: 'Дизайн',
    rating: 4.9,
    avatar: 'path/to/avatar2.jpg',
    description: 'Креативный дизайнер с опытом работы в UI/UX.',
    tags: ['UX/UI', 'Photoshop', 'Illustrator'],
    price: 1200, // Цена за час
  },
  {
    id: 3,
    name: 'Игорь Кузнецов',
    category: 'Мобильные приложения',
    rating: 4.7,
    avatar: 'path/to/avatar3.jpg',
    description: 'Специалист по разработке мобильных приложений под iOS и Android.',
    tags: ['iOS', 'Android', 'Flutter'],
    price: 1500, // Цена за час
  },
  // Добавьте больше специалистов по мере необходимости
];

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFilters(prev => {
    const newFilters = { ...prev, [name]: value };
    filterOrders(newFilters);
    return newFilters;
  });
};

const Specialists = () => {
  return (
    <div className="specialists-page">
      <Navbar />
      <header className="specialists-header">
        <h1>Фрилансеры</h1>
        <section className="search-section1">
          <input 
            type="text" 
            placeholder="Поиск фрилансеров..." 
            className="search-input" 
            name="searchText" 
            onChange={handleInputChange} 
          />
          <button className="search-button">
            <FaSearch className="search-icon" />
          </button>
        </section>
      </header>

      {/* Вставляем компонент фильтров */}
      <Filters />

      <section className="specialists-list">
        {specialistsData.map(specialist => (
          <SpecialistCard
            key={specialist.id}
            name={specialist.name}
            category={specialist.category}
            rating={specialist.rating}
            avatar={specialist.avatar}
            description={specialist.description}
            tags={specialist.tags}
            price={specialist.price} // Передаем цену
          />
        ))}
      </section>
    </div>
  );
};

export default Specialists;
