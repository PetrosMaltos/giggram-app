import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import './DealDetail.css';
import { FaArrowRight } from "react-icons/fa";
import Loading from "./components/Loading";

const DealDetail = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [dealInfo, setDealInfo] = useState({});
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [timer, setTimer] = useState(30);
    const [loading, setLoading] = useState(true);
    const { dealId } = useParams();
    const navigate = useNavigate();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const fetchUserData = async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.exists() ? userDoc.data() : { username: 'Неизвестный пользователь', hasSubscription: false };
    };

    useEffect(() => {
        const fetchDealData = async () => {
            const dealDoc = await getDoc(doc(db, 'deals', dealId));
            if (dealDoc.exists()) {
                const data = dealDoc.data();
                console.log('Deal Data:', data);
                const clientData = await fetchUserData(data.clientId);
                const freelancerData = await fetchUserData(data.freelancerId);
                setDealInfo({
                    ...data,
                    clientUsername: clientData.username,
                    freelancerUsername: freelancerData.username,
                    freelancerHasSubscription: freelancerData.hasSubscription
                });
                if (data.stage && data.stage !== 'Заказ') {
                    navigate(`/deal/${dealId}/${data.stage.toLowerCase()}`);
                }
            }
            setLoading(false);
        };
        fetchDealData();
    }, [dealId, navigate]);

    useEffect(() => {
        const dealRef = doc(db, 'deals', dealId);
        const unsubscribe = onSnapshot(dealRef, (dealSnap) => {
            if (dealSnap.exists()) {
                const dealData = dealSnap.data();
                console.log('Real-time Deal Data:', dealData);
                setDealInfo(dealData);
                if (dealData.stage === 'Оплата') {
                    setCurrentStep(2);
                    navigate(`/deal/${dealId}/payment`);
                } else if (dealData.stage === 'Работа') {
                    setCurrentStep(3);
                    navigate(`/deal/${dealId}/work`);
                } else if (dealData.stage === 'Отзыв') {
                    setCurrentStep(4);
                    navigate(`/deal/${dealId}/review`);
                } else {
                    setCurrentStep(1);
                }
            } else {
                console.error('Сделка не найдена');
            }
        });
        return () => unsubscribe();
    }, [dealId, navigate]);

    useEffect(() => {
        if (timer > 0) {
            const countdown = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(countdown);
        } else {
            setButtonDisabled(false);
        }
    }, [timer]);

    const handleStartClick = async () => {
        try {
            await updateDoc(doc(db, 'deals', dealId), { stage: 'Оплата' });
            setCurrentStep(2);
            navigate(`/deal/${dealId}/payment`);
        } catch (error) {
            console.error('Ошибка при обновлении этапа сделки:', error);
        }
    };

    const steps = ['Заказ', 'Оплата', 'Работа', 'Отзыв'];

    const commissionRate = 0.1;
    const freelancerHasSubscription = dealInfo.freelancerHasSubscription;
    const rewardWithCommission = freelancerHasSubscription
        ? dealInfo.reward
        : (dealInfo.reward * (1 - commissionRate)).toFixed(2);

    const isFreelancer = currentUser && currentUser.uid === dealInfo.freelancerId;

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="deal-container">
            <h1 className="main-title">Детали сделки {dealInfo.title}</h1>
            <div className="steps-nav">
                {steps.map((step, index) => (
                    <div key={index} className={`step ${currentStep === index + 1 ? 'active' : ''}`}>
                        {step}
                    </div>
                ))}
            </div>
            <div className="deal-info">
                <h2 className="deal-title">Информация о заказе</h2>
                <div className="deal-details">
                    <div className="detail-item">
                        <span className="detail-label">Цена:</span> {dealInfo.price} ₽
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Заказчик:</span> {dealInfo.clientUsername}
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Исполнитель:</span> {dealInfo.freelancerUsername}
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Сроки:</span> {dealInfo.deadlines} дней
                    </div>
                    {isFreelancer && (
                        <div className="detail-item">
                            <span className="detail-label">Вознаграждение:</span>
                            <span className="reward-amount">{rewardWithCommission} ₽</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="deal-requirements">
                <h2 className="requirements-title">Описание заказа</h2>
                <p className="requirements-text">{dealInfo.description || 'Описание отсутствует'}</p>
            </div>
            <div className="files">
                <h2 className="files-title">Прикрепленные файлы</h2>
                <ul className="files-list">
                    {dealInfo.files && dealInfo.files.map((file, index) => (
                        <li key={index}>
                            <a href={file.url} className="file-link">{file.name}</a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="start-button-container">
                <button
                    className="start-button"
                    disabled={buttonDisabled}
                    onClick={handleStartClick}
                >
                    {buttonDisabled ? `Приступить (${timer} сек)` : 'Приступить'}
                    <FaArrowRight
                        style={{
                            width: '18px',
                            height: '18px',
                            marginLeft: '10px',
                            verticalAlign: 'middle'
                        }}
                    />
                </button>
            </div>
        </div>
    );
};

export default DealDetail;