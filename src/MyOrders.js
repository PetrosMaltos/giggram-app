import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import OrderCard from './components/OrderCard';
import Loading from './components/Loading';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.warn('Пользователь не авторизован');
      setLoading(false);
      return;
    }
    console.log('Пользователь авторизован с UID:', user.uid);

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('createdBy', '==', user.uid));

    // Используем onSnapshot для получения данных в реальном времени
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        console.log('Нет заказов для данного пользователя.');
        setOrders([]);
      } else {
        const ordersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Найденные заказы:', ordersList);
        setOrders(ordersList);
      }
      setLoading(false);
    }, (error) => {
      console.error('Ошибка при получении заказов:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []); // Зависимости пусты, запрос выполнится один раз при монтировании

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="my-orders-page">
      <header>
        <h1>Мои заказы</h1>
      </header>
      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map(order => (
            <OrderCard
            key={order.id}
            id={order.id}
            title={order.title}
            tags={order.tags}
            description={order.description}
            createdAt={order.createdAt}
            price={order.price}
            responses={order.responses}
            views={order.views}
            isAssigned={order.isAssigned}
            status={order.status}  
          />
          ))
        ) : (
          <div className="no-orders-message">У вас нет заказов</div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
