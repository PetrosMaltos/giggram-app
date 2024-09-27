import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import './Chat.css';

const Chat = ({ dealId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null); // для прокрутки вниз

  useEffect(() => {
    const q = query(collection(db, 'messages'), where('dealId', '==', dealId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [dealId]);

  // Прокрутка чата к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' && !file) return;

    const user = auth.currentUser;
    if (!user) return;

    const messageData = {
      dealId,
      userId: user.uid,
      text: newMessage,
      fileUrl: file ? URL.createObjectURL(file) : null,
      timestamp: new Date(),
    };

    try {
      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
      setFile(null);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    }
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className={`message`}>
            <p>{message.text}</p>
            {message.fileUrl && <a href={message.fileUrl} download>Скачать файл</a>}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Ключ для прокрутки вниз */}
      </div>
      <div className="new-message">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение"
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleSendMessage}>Отправить</button>
      </div>
    </div>
  );
};

export default Chat;
