import React, { useState, useEffect } from 'react';

const Snackbar = ({ message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed hover:cursor-pointer bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {message}
    </div>
  );
};

export default Snackbar;
