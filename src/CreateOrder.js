import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from './firebaseConfig';
import { collection, addDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './CreateOrder.css';
import { FaRegClipboard, FaTag, FaDollarSign, FaListUl, FaRegEdit, FaClock } from 'react-icons/fa';

const categories = [
    'Веб-дизайн',
    'Разработка сайтов',
    'Графический дизайн',
    'Копирайтинг',
    'Маркетинг',
    'SEO-оптимизация',
    'Разработка приложений',
    'Переводы'
];

const deadlineOptions = [
    { label: '1 день', value: 1 },
    { label: '3 дня', value: 3 },
    { label: 'Неделя', value: 7 },
    { label: '2 недели', value: 14 },
    { label: 'Месяц', value: 30 },
];

const CreateOrder = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        tags: '',
        deadline: '', // новое поле для выбора срока выполнения
    });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, description, category, price, tags, deadline } = formData;

        if (!title || !description || !category || !price || isNaN(price) || parseFloat(price) <= 0 || !deadline) {
            setError('Пожалуйста, заполните все поля корректно.');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
            return;
        }

        const newOrder = {
            title,
            description,
            category,
            price: parseFloat(price),
            tags: tags.split(',').map(tag => tag.trim()),
            views: 0,
            responses: [],
            createdAt: Timestamp.now(),
            deadline: parseInt(deadline),
            createdBy: user.uid,
            clientId: user.uid,
            files: [],
            status: 'pending'
        };

        try {
            const orderDocRef = await addDoc(collection(db, 'orders'), newOrder);
            const orderId = orderDocRef.id;

            // Загрузка файлов в Firebase Storage
            const fileUploadPromises = files.map(async (file) => {
                const storageRef = ref(storage, `orders/${orderId}/${file.name}`);
                await uploadBytes(storageRef, file);
                const fileURL = await getDownloadURL(storageRef);
                return { name: file.name, url: fileURL };
            });

            const uploadedFiles = await Promise.all(fileUploadPromises);
            await updateDoc(orderDocRef, { files: uploadedFiles });

            setSuccess('Заказ отправлен на модерацию!');
            setTimeout(() => navigate('/orders'), 1500);
        } catch (error) {
            setError('Ошибка создания заказа. Попробуйте еще раз.');
            console.error('Ошибка создания заказа:', error);
        }
    };

    return (
        <div className="create-order-page">
            <div className="create-order-container">
                <h1><FaRegClipboard /> Создать новый заказ</h1>
                <form onSubmit={handleSubmit} className="create-order-form">
                    <label>
                        <FaRegEdit /> Заголовок
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        <FaListUl /> Описание
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        <FaTag /> Категория
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            className="category-select"
                        >
                            <option value="" disabled>Выберите категорию</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <FaDollarSign /> Цена
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                        />
                    </label>
                    <label>
                        <FaTag /> Хэштеги (через запятую)
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        <FaClock /> Срок выполнения заказа
                        <select
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            required
                            className="category-select"
                        >
                            <option value="" disabled>Выберите срок выполнения</option>
                            {deadlineOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <FaRegClipboard /> Прикрепить файлы
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />
                    </label>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <button type="submit" className="submit-button">Создать заказ!</button>
                </form>
            </div>
        </div>
    );
};

export default CreateOrder;