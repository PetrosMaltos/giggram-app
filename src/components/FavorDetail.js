import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AiFillStar } from 'react-icons/ai';
import { FaDollarSign, FaEye, FaClock, FaCommentDots, FaLock } from 'react-icons/fa';
import './FavorDetail.css';
import { db, auth } from '../firebaseConfig';
import { setDoc, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Loading from './Loading';

const FavorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [favor, setFavor] = useState(null);
    const [response, setResponse] = useState('');
    const [timeAgo, setTimeAgo] = useState('');
    const [userData, setUserData] = useState(null);
    const [responses, setResponses] = useState([]);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [creatorData, setCreatorData] = useState(null);

    useEffect(() => {
        const fetchFavor = async () => {
            if (!id) {
                console.error('ID услуги не найден');
                return;
            }
            try {
                const favorRef = doc(db, 'favors', id);
                const favorSnap = await getDoc(favorRef);
                if (favorSnap.exists()) {
                    const favorData = favorSnap.data();
                    setFavor(favorData);
                    setResponses(favorData.responses || []);
                    
                    let createdAtDate = favorData.createdAt instanceof Date ? 
                        favorData.createdAt : favorData.createdAt.toDate();

                    const updateTimer = () => {
                        setTimeAgo(formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru }));
                    };
                    updateTimer();
                    const timer = setInterval(updateTimer, 60000);

                    if (favorData.createdBy) {
                        const creatorRef = doc(db, 'users', favorData.createdBy);
                        const creatorSnap = await getDoc(creatorRef);
                        if (creatorSnap.exists()) {
                            setCreatorData(creatorSnap.data());
                        }
                    }
                    return () => clearInterval(timer);
                } else {
                    console.error('Услуга не найдена');
                }
            } catch (error) {
                console.error('Ошибка получения данных услуги:', error);
            }
        };

        fetchFavor();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsUserLoggedIn(!!user);
            if (user) fetchUserData(user.uid);
            else setUserData(null);
        });

        return () => unsubscribe();
    }, [id]);

    const fetchUserData = async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserData(userSnap.data());
            }
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
        }
    };

    const handleResponseChange = (e) => setResponse(e.target.value);

    const handleSubmit = async () => {
        if (userData && response.trim()) {
            if (userData.uid === favor.createdBy) {
                alert('Вы не можете откликаться на свою собственную услугу.');
                return;
            }

            const existingResponse = responses.find(res => res.userId === userData.uid);
            if (existingResponse) {
                alert('Вы уже откликнулись на эту услугу.');
                return;
            }

            try {
                const newResponse = {
                    userId: userData.uid,
                    text: response.trim(),
                    createdAt: new Date().toISOString(),
                };
                const favorRef = doc(db, 'favors', id);
                await updateDoc(favorRef, { responses: arrayUnion(newResponse) });

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

    if (!favor) {
        return <Loading />;
    }

    return (
        <div className="favor-detail">
            <div className="favor-info">
                <h1 className="favor-title">{favor.title}</h1>
                <p className="favor-description">{favor.description}</p>
                <div className="favor-details">
                    <div className="favor-info-item">
                        <FaDollarSign className="favor-icon" />
                        <span className="favor-price">{favor.price} руб.</span>
                    </div>
                    <div className="favor-info-item">
                        <FaEye className="favor-icon" />
                        <span className="favor-views">{favor.views || 0} просмотров</span>
                    </div>
                    <div className="favor-info-item">
                        <FaClock className="favor-icon" />
                        <span className="favor-time">{timeAgo}</span>
                    </div>
                </div>
                <div className="divider" />
            </div>

            {userData?.uid === favor.createdBy ? (
                <div className="responses-list">
                    <h2>Отклики</h2>
                    {responses.length > 0 ? (
                        responses.map((res, index) => {
                            const createdAtDate = new Date(res.createdAt);
                            return (
                                <div key={index} className="response-item">
                                    <div className="response-header">
                                        <span className="response-username">{userMap[res.userId]?.username || 'Неизвестный пользователь'}</span>
                                        <span className="response-date">{formatDistanceToNow(createdAtDate, { addSuffix: true, locale: ru })}</span>
                                    </div>
                                    <div className="response-text">{res.text}</div>
                                </div>
                            );
                        })
                    ) : (
                        <p>Нет откликов.</p>
                    )}
                </div>
            ) : (
                <div className="response-section">
                    {isUserLoggedIn ? (
                        <div className="response-form">
                            <textarea
                                className="response-textarea"
                                placeholder="Напишите ваш отклик здесь..."
                                value={response}
                                onChange={handleResponseChange}
                            />
                            <button className="response-button" onClick={handleSubmit}>
                                Отправить
                            </button>
                        </div>
                    ) : (
                        <div className="registration-message">
                            <FaLock className="lock-icon" />
                            <h2>Пожалуйста, зарегистрируйтесь</h2>
                            <p>Для отправки отклика на эту услугу необходимо зарегистрироваться.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FavorDetail;
