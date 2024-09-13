import React from 'react';
import styles from './PaymentOrder.module.css'; // Импорт стилей CSS модуля

const PaymentOrder = () => {
  return (
    <div className={styles.paymentContainer}>
      <header className={styles.paymentHeader}>
        <h1>Оплата заказа</h1>
      </header>
      <section className={styles.orderDetails}>
        <h2>Информация о заказе</h2>
        <div className={styles.orderSummary}>
          <div className={styles.orderItem}>
            <span className={styles.label}>Название заказа:</span>
            <span className={styles.value}>Разработка сайта</span>
          </div>
          <div className={styles.orderItem}>
            <span className={styles.label}>Цена:</span>
            <span className={styles.value}>$500.00</span>
          </div>
          <div className={styles.orderItem}>
            <span className={styles.label}>Заказчик:</span>
            <span className={styles.value}>Иван Иванов</span>
          </div>
          <div className={styles.orderItem}>
            <span className={styles.label}>Исполнитель:</span>
            <span className={styles.value}>Алексей Смирнов</span>
          </div>
          <div className={styles.orderItem}>
            <span className={styles.label}>Сроки:</span>
            <span className={styles.value}>1 месяц</span>
          </div>
        </div>
      </section>
      <section className={styles.paymentAction}>
        <button className={styles.payButton}>Подтвердить оплату</button>
      </section>
      <section className={styles.paymentTips}>
        <h3>Советы:</h3>
        <ul>
          <li>Проверьте правильность всех данных перед оплатой.</li>
          <li>Свяжитесь с нами, если у вас возникнут вопросы.</li>
          <li>После оплаты вы получите подтверждение на вашу электронную почту.</li>
        </ul>
      </section>
    </div>
  );
};

export default PaymentOrder;
