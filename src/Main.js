import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './Main.css';
import { FaSearch, FaUser } from 'react-icons/fa'; 
import OrderCard from './components/OrderCard';
import { List } from 'lucide-react';
import Categories from './components/Categories';
import LogoAnimation from './components/LogoAnimation';
import Navbar from './components/Navbar';
import Services from './components/Services';
import { MdOutlineMoodBad } from "react-icons/md";
import { getAuth } from 'firebase/auth';

const SearchResult = ({ result, onClick, isCurrentUser }) => {
  return (
    <div className="search-result-item" onClick={() => onClick(result)}>
      {result.type === 'user' ? (
        <div className="search-result-user">
          <FaUser className="search-result-icon" />
          <div>
            <p className="search-username">
              {isCurrentUser ? 'Вы' : result.username}
            </p>
            <p className="search-description">
              {result.description || 'Нет описания'}
            </p>
          </div>
        </div>
      ) : (
        <div className="search-result-order">
          <List className="search-result-icon" />
          <div>
            <p className="search-order-title">{result.title}</p>
            <p className="search-order-details">
              {result.description || 'Нет описания'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const Main = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [latestOrders, setLatestOrders] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    // Получаем текущего пользователя
    const fetchCurrentUser = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setCurrentUserId(user.uid);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchLatestOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLatestOrders(orders);
      } catch (error) {
        console.error("Ошибка при загрузке последних заказов:", error);
        setError('Не удалось загрузить новые заказы');
      }
    };

    fetchLatestOrders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        handleSearch();
      }, 300); 
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsDropdownVisible(false);
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      // Поиск пользователей
      const usersQuery = query(
        collection(db, 'users'),
        where('username', '>=', searchQuery),
        where('username', '<=', searchQuery + '\uf8ff')
      );
      // Поиск заказов
      const ordersQuery = query(
        collection(db, 'orders'),
        where('title', '>=', searchQuery),
        where('title', '<=', searchQuery + '\uf8ff')
      );
      const [usersSnapshot, ordersSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(ordersQuery)
      ]);
      const usersResults = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'user',
        username: doc.data().username,
        avatar: doc.data().avatar || 'https://via.placeholder.com/50',
        description: doc.data().description
      }));
      const ordersResults = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'order',
        title: doc.data().title,
        description: doc.data().description 
      }));
      const combinedResults = [...usersResults, ...ordersResults];
      setSearchResults(combinedResults);
      setIsDropdownVisible(combinedResults.length > 0);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      setError('Ошибка при выполнении поиска');
      setIsLoading(false);
    }
  };

  const handleResultClick = (result) => {
    setIsDropdownVisible(false);
    if (result.type === 'user') {
      if (result.id === currentUserId) {
        navigate('/profile');
      } else {
        navigate(`/users/${result.id}`);
      }
    } else if (result.type === 'order') {
      navigate(`/orders/${result.id}`);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setIsDropdownVisible(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsDropdownVisible(false);
    }, 200);
  };

  return (
    <div className="main-page">
      <Navbar />
      <header className="main-header">
        <LogoAnimation />
        <h1 className="header-title">
          <span className="gradient-text">GigGram</span>: Ваш Центр Фриланса
        </h1>
        <p>Найдите проекты и соединитесь с клиентами.</p>
      </header>
      <section className="search-section-main">
        <input
          type="text"
          placeholder="Искать заказы или @пользователей"
          className="search-input"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          ref={inputRef}
        />
        <button className="search-button" onClick={handleSearch}>
          <FaSearch className="search-icon" />
        </button>
        {isDropdownVisible && (
          <div className={`search-dropdown ${isDropdownVisible ? 'show' : ''}`}>
            {isLoading ? (
              <div className="search-result-item">Загрузка...</div>
            ) : error ? (
              <div className="search-result-item">{error}</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(result => (
                <SearchResult
                  key={result.id}
                  result={result}
                  onClick={handleResultClick}
                  isCurrentUser={result.id === currentUserId}
                />
              ))
            ) : (
              <div className="search-result-item no-results">
                Ничего не найдено
              </div>
            )}
          </div>
        )}
      </section>
      <section className="featured-orders-section">
        <h2>Новые заказы</h2>
        <div className="main-list">
          {latestOrders.length > 0 ? (
            latestOrders.map((order) => (
              <div key={order.id} onClick={() => navigate(`/orders/${order.id}`)}>
                <OrderCard {...order} />
              </div>
            ))
          ) : (
            <div className="no-orders-message">
              <MdOutlineMoodBad className="no-orders-emoji" />
              Упс! На данный момент нет новых заказов. Пожалуйста, проверьте позже.
            </div>
          )}
        </div>
      </section>
      <section className="categories-section">
        <h2>Категории</h2>
        <Categories />
      </section>
      <section className="services-section">
        <h2>Услуги и Цены</h2>
        <Services />
      </section>
    </div>
  );
};

export default Main;
