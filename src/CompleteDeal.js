import React from 'react';
import { useParams } from 'react-router-dom';
import { updateDeal } from './dealUtils'; // Импорт функции обновления
import { useDeal } from './hooks/useDeal'; // Хук для получения данных сделки

const CompleteDeal = () => {
  const { dealId } = useParams();
  const { deal, loading, error } = useDeal(dealId);

  const handleCompleteDeal = async () => {
    await updateDeal(dealId, { status: 'completed', paymentStatus: 'released' });
    // Можете добавить что-то здесь, например, уведомление или перенаправление
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;
  if (!deal) return <p>Сделка не найдена</p>;

  return (
    <div className="step-container">
      <h2>Завершение сделки</h2>
      <button onClick={handleCompleteDeal}>Завершить сделку</button>
    </div>
  );
};

export default CompleteDeal;
