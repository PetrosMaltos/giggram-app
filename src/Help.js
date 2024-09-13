import React, { useState } from 'react';
import './Help.css'; // Import styles
import Navbar from './components/Navbar';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <h3>{question}</h3>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
};

const Help = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    alert('Ваше сообщение отправлено!');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const faqs = [
    {
      question: "Как создать новый проект?",
      answer: "Чтобы создать новый проект, перейдите на страницу 'Проекты' и нажмите на кнопку 'Создать новый проект'. Заполните необходимые данные и нажмите 'Сохранить'."
    },
    {
      question: "Как редактировать проект?",
      answer: "Для редактирования проекта откройте проект на странице 'Мои проекты' и нажмите на кнопку 'Редактировать'. Внесите необходимые изменения и сохраните их."
    },
    {
      question: "Как связаться с поддержкой?",
      answer: "Для связи с поддержкой воспользуйтесь формой обратной связи ниже."
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="help-container">
      <Navbar />
      <header className="help-header">
        <h1>Помощь</h1>
      </header>
      <section className="faq-section">
        <h2>Часто задаваемые вопросы</h2>
        <input 
          type="text"
          className="faq-search"
          placeholder="Поиск по вопросам..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {filteredFAQs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </section>
      <section className="contact-section">
        <h2>Остались вопросы?</h2>
        <form onSubmit={handleSubmit} className="contact-form">
          <label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder='Имя'
            />
          </label>
          <label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder='Почта'
            />
          </label>
          <label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder='Тема'
            />
          </label>
          <label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
              placeholder='Сообщение'
            />
          </label>
          <button type="submit" className="submit-button">Отправить</button>
        </form>
      </section>
    </div>
  );
};

export default Help;
