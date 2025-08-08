import React, { useEffect, useState } from 'react';
import '../css/error.css';
import '../css/form-error.css';

const ShowErrorLabel = ({ message, type = 'floating' }) => {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2500); // 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!visible) return null;

  const className = type === 'floating' ? 'floating-error' : 'form-error';

  return (
    <div className={className}>
      {message}
    </div>
  );
};

export default ShowErrorLabel;
