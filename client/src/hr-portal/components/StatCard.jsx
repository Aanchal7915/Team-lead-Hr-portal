// src/components/dashboard/StatCard.jsx
import React from 'react';
import Card from './Card.jsx';

const StatCard = ({ title, value, icon, colorClass = 'text-blue-500' }) => {
  return (
    <Card className="!p-4">
      <div className="flex flex-col">
        <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-xl sm:text-2xl font-black text-[#433020]">{value}</p>
        {icon && <div className={`mt-2 text-2xl ${colorClass}`}>{icon}</div>}
      </div>
    </Card>
  );
};

export default StatCard;
