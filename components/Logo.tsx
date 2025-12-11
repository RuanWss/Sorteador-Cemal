import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex justify-center mb-8">
      <img 
        src="https://i.ibb.co/kgxf99k5/LOGOS-10-ANOS-BRANCA-E-VERMELHA.png" 
        alt="Logo 10 Anos" 
        className="h-32 md:h-40 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform duration-500"
      />
    </div>
  );
};

export default Logo;