import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Moderation.css';
import { FaCheck, FaTimes, FaSearch } from 'react-icons/fa';

const Moderation = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('projects'); // Показ проектов по умолчанию
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        const userData = userDoc.docs[0]?.data();
        if (!userData || userData.role !== 'admin') {
          navigate('/');
          return;
        }

        fetchItems();
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdmin();
  }, [filter, navigate, auth.currentUser]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const itemsQuery = query(collection(db, filter), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(itemsQuery);
      const itemsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsList);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, filter, id), { status: 'approved' });
      fetchItems();
    } catch (error) {
      console.error('Error approving item:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(db, filter, id), { status: 'rejected' });
      fetchItems();
    } catch (error) {
      console.error('Error rejecting item:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filterTitles = {
    orders: 'заказов',
    favors: 'услуг',
    projects: 'проектов'
  };

  return (
    <div className="moderation-page">
      <h1 className='nnnn' >Модерация {filterTitles[filter]}</h1>

      <div className="filter-buttons">
        <button onClick={() => setFilter('orders')} className={filter === 'orders' ? 'active' : ''}>Заказы</button>
        <button onClick={() => setFilter('favors')} className={filter === 'favors' ? 'active' : ''}>Услуги</button>
        <button onClick={() => setFilter('projects')} className={filter === 'projects' ? 'active' : ''}>Проекты</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={handleSearch}
          
        />
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="moderation-items">
          {items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
            <div key={item.id} className="moderation-item">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>Категория: {item.category}</p>
              {item.price !== undefined && <p>Цена: {item.price} руб.</p>}
              <div className="moderation-actions">
                <button className="approve-button" onClick={() => handleApprove(item.id)}>
                  <FaCheck /> Одобрить
                </button>
                <button className="reject-button" onClick={() => handleReject(item.id)}>
                  <FaTimes /> Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Moderation;
