import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPaperclip, FaTelegramPlane, FaTrash } from 'react-icons/fa';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useUser } from './UserContext';
import { useSwipeable } from 'react-swipeable';
import './Work.css';
import { format } from 'date-fns';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

Modal.setAppElement('#root'); // Установите элемент приложения для модального окна

const Work = () => {
  const { dealId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const currentStep = 3;
  const steps = ['Заказ', 'Оплата', 'Работа', 'Отзыв'];
  const [timeLeft, setTimeLeft] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [dealData, setDealData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchDealData = async () => {
      const dealDoc = await getDoc(doc(db, 'deals', dealId));
      if (dealDoc.exists()) {
        const data = dealDoc.data();
        setDealData(data);
        if (data.stage === 'Отзыв') {
          navigate(`/deal/${dealId}/review`);
        } else if (data.stage !== 'Работа') {
          navigate(`/deal/${dealId}/${data.stage.toLowerCase()}`);
        }
      }
    };
    fetchDealData();
  }, [dealId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!dealId) {
      console.error('dealId is undefined or null');
      return;
    }
    const q = query(collection(db, 'deals', dealId, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messages);
    });
    return () => unsubscribe();
  }, [dealId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const messageData = { text: newMessage, sender: user ? user.uid : 'unknown', timestamp: new Date() };
        if (replyTo) {
          messageData.replyTo = replyTo.id;
        }
        await addDoc(collection(db, 'deals', dealId, 'messages'), messageData);
        setNewMessage('');
        setReplyTo(null);
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
      if (file.size > maxSize) {
        alert('Файл слишком большой');
        return;
      }
      try {
        const storage = getStorage();
        const storageRef = ref(storage, `files/${dealId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log('Upload is ' + progress + '% done');
        }, (error) => {
          console.error('Ошибка при загрузке файла:', error);
        }, async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const messageData = { fileName: file.name, fileType: file.type, fileSize: file.size, fileURL: downloadURL, sender: user ? user.uid : 'unknown', timestamp: new Date() };
          if (replyTo) {
            messageData.replyTo = replyTo.id;
          }
          await addDoc(collection(db, 'deals', dealId, 'messages'), messageData);
          setReplyTo(null);
          setUploadProgress(null);
        });
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'deals', dealId, 'messages', messageId));
    } catch (error) {
      console.error('Ошибка при удалении сообщения:', error);
    }
  };

  useEffect(() => {
    if (!dealId) {
      console.error('dealId is undefined or null');
      return;
    }
    const fetchDeal = async () => {
      try {
        const dealDoc = await getDoc(doc(db, 'deals', dealId));
        if (dealDoc.exists()) {
          const dealData = dealDoc.data();
          setDealData(dealData);
          const endTime = dealData.createdAt.toDate().getTime() + dealData.deadline * 24 * 60 * 60 * 1000;
          const interval = setInterval(() => {
            const now = new Date().getTime();
            const timeLeft = endTime - now;
            if (timeLeft <= 0) {
              setTimeLeft('Время истекло');
              clearInterval(interval);
            } else {
              const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
              const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              setTimeLeft(`${days}д ${hours}ч`);
            }
          }, 1000);
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Ошибка при получении данных сделки:', error);
      }
    };
    fetchDeal();
  }, [dealId]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => console.log("Swiped left!", eventData),
    onSwipedRight: (eventData) => console.log("Swiped right!", eventData)
  });

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    const preventScroll = (e) => e.preventDefault();
    if (chatContainer) {
      chatContainer.addEventListener('touchmove', preventScroll, { passive: false });
    }
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('touchmove', preventScroll);
      }
    };
  }, []);

  const handleCompleteDeal = async () => {
    try {
      await updateDoc(doc(db, 'deals', dealId), { stage: 'Отзыв' });
      navigate(`/deal/${dealId}/review`);
    } catch (error) {
      console.error('Ошибка при завершении сделки:', error);
    }
  };

  const handleOpenDispute = async () => {
    try {
      await updateDoc(doc(db, 'deals', dealId), { stage: 'Спор' });
      navigate(`/deal/${dealId}/dispute`);
    } catch (error) {
      console.error('Ошибка при открытии спора:', error);
    }
  };

  const handleRequestExtension = async () => {
    try {
      await updateDoc(doc(db, 'deals', dealId), { extensionRequested: true });
      alert('Запрос на продление времени отправлен');
    } catch (error) {
      console.error('Ошибка при запросе продления времени:', error);
    }
  };

  const openModal = (imageURL) => {
    console.log('Opening modal with image URL:', imageURL); // Лог для отладки
    setModalImage(imageURL);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalImage(null);
  };

  const isFreelancer = dealData && dealData.freelancerId === user.uid;
  const isClient = dealData && dealData.clientId === user.uid;

  return (
    <div className="work-container">
      <h1 className="main-title">Работа над заказом</h1>
      <div className="steps-nav">
        {steps.map((step, index) => (
          <div key={index} className={`step ${currentStep === index + 1 ? 'active' : ''}`}>
            {step}
          </div>
        ))}
      </div>
      <div className="progress-container">
        <div className="progress-info">Осталось {timeLeft}</div>
        <div className="progress-bar">
          {dealData && (
            <div className="progress-fill" style={{ width: `${((dealData.deadline * 24 * 60 * 60 * 1000 - (new Date().getTime() - dealData.createdAt.toDate().getTime())) / (dealData.deadline * 24 * 60 * 60 * 1000)) * 100}%` }}></div>
          )}
        </div>
      </div>
      <div className="chat-container" ref={chatContainerRef}>
        {replyTo && (
          <div className="reply-to-container">
            <p>Ответ на: {messages.find(msg => msg.id === replyTo.id)?.text}</p>
            <button onClick={() => setReplyTo(null)}>Отменить</button>
          </div>
        )}
        <div className="chat-messages">
          {messages.map((message, index) => (
            <Message key={index} message={message} user={user} messages={messages} setReplyTo={setReplyTo} handleDeleteMessage={handleDeleteMessage} openModal={openModal} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container">
          <button className="upload-button" onClick={() => fileInputRef.current.click()}>
            <FaPaperclip className='send-icon' />
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
          <input className="chat-input" type="text" placeholder="Ваше сообщение..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <button className="send-button" onClick={handleSendMessage}>
            <FaTelegramPlane className='send-icon' />
          </button>
        </div>
        {uploadProgress !== null && (
          <div className="upload-progress">
            Загрузка: {uploadProgress.toFixed(2)}%
          </div>
        )}
      </div>
      {isClient && (
        <button className="complete-deal-button" onClick={handleCompleteDeal}>
          Завершить сделку
        </button>
      )}
      <button className="complete-deal-button" onClick={handleOpenDispute}>
          Открыть спор
        </button>
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Image Modal" className="modal" overlayClassName="overlay" >
        {modalImage ? (
          <div>
            <img src={modalImage} alt="Full screen" style={{ width: '100%' }} />
            <a href={modalImage} download className="download-button">Скачать</a>
          </div>
        ) : (
          <p>Изображение не найдено</p>
        )}
      </Modal>
    </div>
  );
};

const Message = ({ message, user, messages, setReplyTo, handleDeleteMessage, openModal }) => {
  const messageSwipeHandlers = useSwipeable({
    onSwipedLeft: () => setReplyTo(message),
    onSwipedRight: () => setReplyTo(null)
  });
  const isSender = message.sender === (user ? user.uid : 'unknown');
  return (
    <div className={`message ${isSender ? 'client-message' : 'freelancer-message'}`} {...messageSwipeHandlers}>
      {message.fileURL ? (
        message.fileType.startsWith('image/') ? (
          <img src={message.fileURL} alt={message.fileName} className="uploaded-image" onClick={() => openModal(message.fileURL)} />
        ) : (
          <div className="uploaded-file-container">
            <a href={message.fileURL} target="_blank" rel="noopener noreferrer" className="uploaded-file">
              {message.fileName}
            </a>
            <p className="file-info">Размер: {(message.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        )
      ) : (
        <p>{message.text}</p>
      )}
      {message.replyTo && <p className="reply-to">Ответ на: {messages.find(msg => msg.id === message.replyTo)?.text}</p>}
      <span className="message-timestamp">{format(new Date(message.timestamp.seconds * 1000), 'HH:mm')}</span>
    </div>
  );
};

export default Work;