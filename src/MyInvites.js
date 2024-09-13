import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Loading from './components/Loading';
import { useNavigate } from 'react-router-dom';
import './MyInvites.css';

const MyInvites = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvites = async (userId) => {
      try {
        const invitesRef = collection(db, 'invites');
        const q = query(invitesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const invitesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInvites(invitesList);
      } catch (error) {
        console.error('Ошибка при получении приглашений:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        getDoc(userRef).then((userSnap) => {
          if (userSnap.exists()) {
            setUserData(userSnap.data());
            fetchInvites(user.uid);
          } else {
            console.warn('Пользователь не найден в базе данных');
          }
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAccept = async (inviteId) => {
    try {
      const inviteRef = doc(db, 'invites', inviteId);
      const inviteSnap = await getDoc(inviteRef);
      const inviteData = inviteSnap.data();

      if (!inviteData) {
        console.error('Приглашение не найдено');
        return;
      }

      const newDeal = {
        freelancerId: inviteData.userId,
        projectTitle: inviteData.projectTitle,
        status: 'in-progress',
        paymentStatus: 'frozen',
        createdAt: new Date(),
      };

      const dealsRef = collection(db, 'deals');
      const docRef = await addDoc(dealsRef, newDeal);

      await updateDoc(inviteRef, { status: 'accepted' });

      navigate(`/deal/${docRef.id}`);
    } catch (error) {
      console.error('Ошибка при принятии приглашения:', error);
    }
  };

  const handleReject = async (inviteId) => {
    try {
      const inviteRef = doc(db, 'invites', inviteId);
      await updateDoc(inviteRef, { status: 'rejected' });
      setInvites(invites.filter(invite => invite.id !== inviteId)); 
    } catch (error) {
      console.error('Ошибка при отклонении приглашения:', error);
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

  if (loading) {
    return <Loading />;
  }

  if (!userData) {
    return <div className="no-invites-message">Вы не авторизованы</div>;
  }

  return (
    <div className="my-invites-container">
      <div className="invites-header">
        <h1>Мои приглашения</h1>
      </div>
      {invites.length > 0 ? (
        <ul className="invites-list">
          {invites.map(invite => (
            <li key={invite.id} className="invite-item">
              <h2 className="invite-item-title">{invite.projectTitle}</h2>
              <p className="invite-item-message">{invite.message}</p>
              <p className="invite-item-status">Статус: {invite.status}</p>
              <p className="invite-item-sender">Отправитель: {invite.senderName}</p>
              <p className="invite-item-date">Дата: {new Date(invite.createdAt.seconds * 1000).toLocaleDateString()}</p>
              <div className="invite-actions">
                <FaCheck 
                  className="action-icon accept-icon" 
                  onClick={() => handleAccept(invite.id)} 
                />
                <FaTimes 
                  className="action-icon reject-icon" 
                  onClick={() => handleReject(invite.id)} 
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-invites-message">У вас нет приглашений</div>
      )}
    </div>
  );
};

export default MyInvites;
