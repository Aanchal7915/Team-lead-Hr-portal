const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-md shadow-lg shadow-[#433020]/5 border border-white/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#433020]/10 hover:-translate-y-1 ${className}`}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
