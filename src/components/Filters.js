import React, { useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import './Filters.css';

const Filters = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleCheckboxChange = (e) => {
    console.log(e.target.name, e.target.value, e.target.checked);
  };

  const handleInputChange = (e) => {
    console.log(e.target.name, e.target.value);
  };

  return (
    <section className="filter-section">
      <button
        className={`filter-toggle ${showFilters ? 'active' : ''}`}
        onClick={() => setShowFilters(!showFilters)}
      >
        Фильтры {showFilters ? <FaAngleUp /> : <FaAngleDown />}
      </button>

      <div className={`filters ${showFilters ? 'show' : 'hide'}`}>
        <div className="filter-group">
          <h3>Искать в</h3>
          <label>
            <input type="checkbox" name="searchIn" value="tags" onChange={handleCheckboxChange} /> Теги
          </label>
          <label>
            <input type="checkbox" name="searchIn" value="titles" onChange={handleCheckboxChange} /> Названия
          </label>
          <label>
            <input type="checkbox" name="searchIn" value="descriptions" onChange={handleCheckboxChange} /> Описания
          </label>
        </div>

        <div className="filter-group">
          <h3>Категории</h3>
          <div className="category-list">
            <label>
              <input type="checkbox" name="categories" value="Веб-разработка" onChange={handleCheckboxChange} /> Веб-разработка
            </label>
            <label>
              <input type="checkbox" name="categories" value="Графический дизайн" onChange={handleCheckboxChange} /> Графический дизайн
            </label>
            <label>
              <input type="checkbox" name="categories" value="Копирайтинг" onChange={handleCheckboxChange} /> Копирайтинг
            </label>
            {showMore && (
              <>
                <label>
                  <input type="checkbox" name="categories" value="Цифровой маркетинг" onChange={handleCheckboxChange} /> Цифровой маркетинг
                </label>
                <label>
                  <input type="checkbox" name="categories" value="SEO-услуги" onChange={handleCheckboxChange} /> SEO-услуги
                </label>
                <label>
                  <input type="checkbox" name="categories" value="Разработка мобильных приложений" onChange={handleCheckboxChange} /> Разработка мобильных приложений
                </label>
                <label>
                  <input type="checkbox" name="categories" value="Видеомонтаж" onChange={handleCheckboxChange} /> Видеомонтаж
                </label>
                <label>
                  <input type="checkbox" name="categories" value="Виртуальная помощь" onChange={handleCheckboxChange} /> Виртуальная помощь
                </label>
                <label>
                  <input type="checkbox" name="categories" value="UX/UI дизайн" onChange={handleCheckboxChange} /> UX/UI дизайн
                </label>
                <label>
                  <input type="checkbox" name="categories" value="Ввод данных" onChange={handleCheckboxChange} /> Ввод данных
                </label>
                <label>
                  <input type="checkbox" name="categories" value="Услуги перевода" onChange={handleCheckboxChange} /> Услуги перевода
                </label>
              </>
            )}
            <button className="more-button" onClick={() => setShowMore(!showMore)}>
              {showMore ? 'Скрыть <' : 'Больше >'}
            </button>
          </div>
        </div>

        <div className="filter-group">
          <h3>Ценовой диапазон</h3>
          <div className="price-filter">
            <input 
              type="number" 
              name="priceFrom" 
              placeholder="От" 
              onChange={handleInputChange} 
            />
            <input 
              type="number" 
              name="priceTo" 
              placeholder="До" 
              onChange={handleInputChange} 
            />
          </div>
        </div>

        <div className="filter-group margin-bottom-20">
          <h3>Время</h3>
          <label>
            <input type="checkbox" name="time" value="newest" onChange={handleCheckboxChange} /> Новые
          </label>
          <label>
            <input type="checkbox" name="time" value="oldest" onChange={handleCheckboxChange} /> Старые
          </label>
        </div>
      </div>
    </section>
  );
};

export default Filters;
