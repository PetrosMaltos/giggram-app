import React, { useState, useEffect } from 'react';
import FavorCard from './components/FavorCard';
import { FaSearch, FaAngleDown, FaAngleUp, FaPlus } from 'react-icons/fa';
import Navbar from './components/Navbar';
import { db, collection, onSnapshot } from './firebaseConfig';
import './Favors.css';

const Favors = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState({
    searchIn: [],
    time: [],
    searchText: '',
    priceFrom: '',
    priceTo: '',
    categories: [],
  });
  const [favorsData, setFavorsData] = useState([]);
  const [filteredFavors, setFilteredFavors] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'favors'), (snapshot) => {
      const favors = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        };
      });
      // Сортируем услуги по дате создания в порядке убывания
      const sortedFavors = favors.sort((a, b) => b.createdAt - a.createdAt);
      setFavorsData(sortedFavors);
      setFilteredFavors(sortedFavors);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterFavors(filters);
  }, [filters, favorsData]);

  const handleCheckboxChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev };
      if (name === 'categories') {
        newFilters.categories = newFilters.categories.includes(value)
          ? newFilters.categories.filter(cat => cat !== value)
          : [...newFilters.categories, value];
      } else {
        newFilters[name] = newFilters[name].includes(value)
          ? newFilters[name].filter(item => item !== value)
          : [...(Array.isArray(newFilters[name]) ? newFilters[name] : []), value];
      }
      return newFilters;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filterFavors = (filters) => {
    const { searchIn, searchText, priceFrom, priceTo, categories } = filters;
    const lowerSearchText = searchText.toLowerCase();
    const newFilteredFavors = favorsData.filter(favor => {
      const matchesCategory = !categories.length || categories.includes(favor.category);
      const matchesSearchIn = !searchIn.length || searchIn.some(search => favor.tags.includes(search));
      const matchesSearchText = !searchText || [favor.title, favor.description, ...favor.tags].some(text => text.toLowerCase().includes(lowerSearchText));
      const matchesPrice = (priceFrom === '' || parseFloat(favor.price) >= parseFloat(priceFrom)) && (priceTo === '' || parseFloat(favor.price) <= parseFloat(priceTo));
      return matchesCategory && matchesSearchIn && matchesSearchText && matchesPrice;
    });
    setFilteredFavors(newFilteredFavors);
  };

  const handleCreateFavorClick = () => {
    window.location.href = '/create-favor';
  };

  return (
    <div className="favors-page">
      <Navbar />
      <div className="search-filters-container">
        <header className="favors-header">
          <h1>Услуги ({filteredFavors.length})</h1>
        </header>
        <section className="search-section">
          <input
            type="text"
            placeholder="Поиск услуг..."
            className="search-input"
            name="searchText"
            onChange={handleInputChange}
          />
          <button className="search-button" onClick={() => filterFavors(filters)}>
            <FaSearch className="search-icon" />
          </button>
        </section>
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
                <input
                  type="checkbox"
                  name="searchIn"
                  value="tags"
                  onChange={handleCheckboxChange}
                /> Теги
              </label>
              <label>
                <input
                  type="checkbox"
                  name="searchIn"
                  value="titles"
                  onChange={handleCheckboxChange}
                /> Названия
              </label>
              <label>
                <input
                  type="checkbox"
                  name="searchIn"
                  value="descriptions"
                  onChange={handleCheckboxChange}
                /> Описания
              </label>
            </div>
            <div className="filter-group">
              <h3>Категории</h3>
              <div className="category-list">
                <label>
                  <input
                    type="checkbox"
                    name="categories"
                    value="Веб-разработка"
                    onChange={handleCheckboxChange}
                  /> Веб-разработка
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="categories"
                    value="Графический дизайн"
                    onChange={handleCheckboxChange}
                  /> Графический дизайн
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="categories"
                    value="Копирайтинг"
                    onChange={handleCheckboxChange}
                  /> Копирайтинг
                </label>
                {showMore && (
                  <>
                    <label>
                      <input
                        type="checkbox"
                        name="categories"
                        value="Цифровой маркетинг"
                        onChange={handleCheckboxChange}
                      /> Цифровой маркетинг
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="categories"
                        value="SEO-услуги"
                        onChange={handleCheckboxChange}
                      /> SEO-услуги
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="categories"
                        value="Разработка мобильных приложений"
                        onChange={handleCheckboxChange}
                      /> Разработка мобильных приложений
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="categories"
                        value="Видеомонтаж"
                        onChange={handleCheckboxChange}
                      /> Видеомонтаж
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="categories"
                        value="Виртуальная помощь"
                        onChange={handleCheckboxChange}
                      /> Виртуальная помощь
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="categories"
                        value="UX/UI дизайн"
                        onChange={handleCheckboxChange}
                      /> UX/UI дизайн
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="categories"
                        value="Ввод данных"
                        onChange={handleCheckboxChange}
                      /> Ввод данных
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="categories"
                        value="Услуги перевода"
                        onChange={handleCheckboxChange}
                      /> Услуги перевода
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
            <div className="filter-group">
              <h3>Время</h3>
              <label>
                <input
                  type="checkbox"
                  name="time"
                  value="newest"
                  onChange={handleCheckboxChange}
                /> Новейшие
              </label>
              <label>
                <input
                  type="checkbox"
                  name="time"
                  value="oldest"
                  onChange={handleCheckboxChange}
                /> Старейшие
              </label>
            </div>
          </div>
        </section>
        <div className='create-favor-button-container'>
          <button className="create-favor-button" onClick={handleCreateFavorClick}>
            <FaPlus className="create-favor-icon" /> Создать свою услугу
          </button>
        </div>
      </div>
      <div className="favors-list">
        {filteredFavors.length ? filteredFavors.map(favor => (
         <FavorCard
         key={favor.id}
         title={favor.title}
         tags={favor.tags}
         price={favor.price}
         responses={favor.responses}
         imagePaths={favor.imagePaths} // Проверьте, что imagePaths правильно передается
         userAvatar={favor.userAvatar}
         isVerified={favor.isVerified}
       />
       
        )) : <p>Нынче услуг нэт :(</p>}
      </div>
    </div>
  );
};

export default Favors;