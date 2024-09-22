import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AiFillStar } from 'react-icons/ai';
import { FaDollarSign, FaEye, FaClock, FaCommentDots, FaLock } from 'react-icons/fa';
import './OrderDetail.css';
import { db, auth } from '../firebaseConfig';
import { setDoc, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Loading from './Loading';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [response, setResponse] = useState('');
    const [timeAgo, setTimeAgo] = useState('');
    const [userData, setUserData] = useState(null);
    const [responses, setResponses] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [remainingResponses, setRemainingResponses] = useState(5);
    const [creatorData, setCreatorData] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) {
                console.error('ID заказа не найден');
                return;
            }
            try {
                const orderRef = doc(db, 'orders', id);
                const orderSnap = await getDoc(orderRef);
                if (orderSnap.exists()) {
                    const orderData = orderSnap.data();
                    setOrder(orderData);
                    setResponses(orderData.responses || []);
                    let createdAtDate;
                    if (orderData.createdAt instanceof Date) {
                        createdAtDate = orderData.createdAt;
                    } else if (orderData.createdAt && orderData.createdAt.toDate) {
                        createdAtDate = orderData.createdAt.toDate();
                    } else {
                        createdAtDate = new Date(orderData.createdAt);
                    }
                    const updateTimer = () => {
                        setTimeAgo(formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru }));
                    };
                    updateTimer();
                    const timer = setInterval(updateTimer, 60000);
                    if (orderData.createdBy) {
                        const creatorRef = doc(db, 'users', orderData.createdBy);
                        const creatorSnap = await getDoc(creatorRef);
                        if (creatorSnap.exists()) {
                            setCreatorData(creatorSnap.data());
                        }
                    }
                    return () => clearInterval(timer);
                } else {
                    console.error('Заказ не найден');
                }
            } catch (error) {
                console.error('Ошибка получения данных заказа:', error);
            }
        };

        fetchOrder();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsUserLoggedIn(true);
                fetchUserData(user.uid);
            } else {
                setIsUserLoggedIn(false);
                setUserData(null);
            }
        });

        return () => unsubscribe();
    }, [id]);

    const fetchUserData = async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                setUserData(userData);
                const today = new Date().toISOString().split('T')[0];
                const userResponsesToday = userData.responses.filter((response) => response.date.split('T')[0] === today);
                const remainingResponses = 5 - userResponsesToday.length;
                setRemainingResponses(remainingResponses < 0 ? 0 : remainingResponses);
            } else {
                console.warn('Пользователь не зарегистрирован в базе данных');
            }
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
        }
    };

    const handleResponseChange = (e) => {
        setResponse(e.target.value);
    };

    const handleSubmit = async () => {
        if (userData && response.trim()) {
            if (userData.uid === order.createdBy) {
                alert('Вы не можете откликаться на свой собственный заказ.');
                return;
            }
            if (remainingResponses <= 0) {
                alert('Вы исчерпали лимит откликов на сегодня.');
                return;
            }
            try {
                const newResponse = {
                    userId: userData.uid,
                    text: response.trim(),
                    createdAt: new Date(),
                };
                const orderRef = doc(db, 'orders', id);
                await updateDoc(orderRef, { responses: arrayUnion(newResponse) });
                setRemainingResponses((prev) => prev - 1);
                setResponses((prevResponses) => [...prevResponses, newResponse]);
                setResponse('');
                alert('Ваш отклик отправлен!');
            } catch (error) {
                console.error('Ошибка отправки отклика:', error);
                alert('Произошла ошибка при отправке отклика. Пожалуйста, попробуйте еще раз.');
            }
        } else {
            alert('Вы должны быть зарегистрированы и написать отклик, чтобы отправить его.');
        }
    };

    const handleAcceptResponse = async (response) => {
        try {
            const orderRef = doc(db, 'orders', id);
            const orderSnap = await getDoc(orderRef);
            const orderData = orderSnap.data();
            if (!orderData) {
                console.error('Данные заказа не найдены');
                return;
            }
    
            // Создаем сделку
            const dealData = {
                clientId: orderData.clientId,
                freelancerId: response.userId,
                projectTitle: orderData.title,
                status: 'in-progress',
                paymentStatus: 'pending',
                price: orderData.price,
                createdAt: new Date(),
            };
    
            // Создаём сделку для фрилансера
            const freelancerDealRef = doc(db, 'deals', `${response.userId}_${id}`);
            await setDoc(freelancerDealRef, dealData);
    
            // Создаём сделку для заказчика
            const clientDealRef = doc(db, 'deals', `${orderData.clientId}_${id}`);
            await setDoc(clientDealRef, { ...dealData, freelancerId: response.userId });
    
            // Обновляем заказ с принятой откликом
            await updateDoc(orderRef, { acceptedResponse: response, status: 'in-progress' });
    
            alert('Отклик принят, сделка создана для обоих пользователей!');
        } catch (error) {
            console.error('Ошибка принятия отклика:', error);
        }
    };
    
    
    

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

    if (!order) {
        return <Loading />;
    }

    console.log("Order:", order);
    console.log("UserData:", userData);
    console.log("IsUserLoggedIn:", isUserLoggedIn);
    console.log("CreatorData:", creatorData);

    return (
        <div className="order-detail">
            {!order || !userData ? (
                <Loading />
            ) : (
                <>
                    {/* Информация о заказе для всех пользователей */}
                    <div className="order-info">
                        <div className="client-profile">
                            <div className="client-avatar">
                                {creatorData?.avatar ? (
                                    <img src={creatorData.avatar} alt="Client Avatar" />
                                ) : (
                                    <div className="default-avatar">A</div>
                                )}
                            </div>
                            <div className="client-info">
                                <div className="client-name">{creatorData?.username || 'Неизвестный клиент'}</div>
                                <div className="client-reviews">
                                    <AiFillStar className="star-rating" />
                                    <span>4.4</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="order-title">{order.title}</h1>
                        <p className="order-description">{order.description}</p>
                        <div className="order-details">
                            <div className="order-info-item">
                                <FaDollarSign className="order-icon" />
                                <span className="order-price">{order.price} руб.</span>
                            </div>
                            <div className="order-info-item">
                                <FaEye className="order-icon" />
                                <span className="order-views">{order.views || 0} просмотров</span>
                            </div>
                            <div className="order-info-item">
                                <FaClock className="order-icon" />
                                <span className="order-time">{timeAgo}</span>
                            </div>
                            <div className="order-info-item">
                                <FaCommentDots className="order-icon" />
                                <span className="order-responses">{responses.length} откликов</span>
                            </div>
                        </div>
                        <div className="order-tags">
                            {order.tags && order.tags.length > 0 ? (
                                order.tags.map((tag, index) => (
                                    <span key={index} className="tag"># {tag}</span>
                                ))
                            ) : (
                                <span className="order-tag">Нет тегов</span>
                            )}
                        </div>
                        <div className="divider" />
                    </div>
    
                    {/* Логика для создателя заказа */}
                    {userData.uid === order.createdBy ? (
                        <div className="responses-list">
                            <h2>Отклики</h2>
                            {responses.length > 0 ? (
                                responses.map((res, index) => {
                                    const createdAtDate = res.createdAt.toDate ? res.createdAt.toDate() : new Date(res.createdAt);
                                    const username = userMap[res.userId]?.username || 'Неизвестный пользователь';
                                    const avatar = userMap[res.userId]?.avatar || 'default-avatar.png';
                                    return (
                                        <div key={index} className="response-item">
                                            <div className="response-header">
                                                <img src={avatar} alt="User Avatar" className="response-avatar" />
                                                <span className="response-username">{username}</span>
                                                <span className="response-date">{formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru })}</span>
                                            </div>
                                            <div className="response-text">{res.text}</div>
                                            {order.acceptedResponse !== res && (
                                                <button className="accept-button" onClick={() => handleAcceptResponse(res)}>
                                                Принять отклик
                                            </button>
                                            
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p>Нет откликов.</p>
                            )}
                        </div>
                    ) : (
                        /* Логика для остальных пользователей */
                        <div className="response-section">
                            {isUserLoggedIn ? (
                                userData?.uid !== order.createdBy ? (
                                    <div className="response-form">
                                        <div className="response-info">
                                            <span>Осталось откликов: {remainingResponses}</span>
                                        </div>
                                        <textarea
                                            className="response-textarea"
                                            placeholder="Напишите ваш отклик здесь..."
                                            value={response}
                                            onChange={handleResponseChange}
                                        />
                                        <button
                                            className="response-button"
                                            onClick={handleSubmit}
                                            disabled={remainingResponses <= 0}
                                        >
                                            Отправить
                                        </button>
                                    </div>
                                ) : null
                            ) : (
                                <div className="registration-message">
                                    <FaLock className="lock-icon" />
                                    <h2>Пожалуйста, зарегистрируйтесь</h2>
                                    <p>
                                        Для отправки отклика на этот заказ необходимо зарегистрироваться. Пожалуйста,{' '}
                                        <a href="/register">зарегистрируйтесь</a> для продолжения.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
    
};

export default OrderDetail;