import React from 'react';
import '../css/error.css';

const ShowErrorLabel = ({ message, type = 'floating', isError = true }) => {
  if (!message) return null;

  const className = `${type === 'floating' ? 'floating-error' : 'form-error'} ${isError ? 'error' : 'success'}`;

  return (
    <div className={className}>
      {message}
    </div>
  );
};

export default ShowErrorLabel;
