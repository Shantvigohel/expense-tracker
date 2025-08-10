import React, { useEffect, useState } from 'react';
import '../css/error.css';
import '../css/form-error.css';

const ShowErrorLabel = ({ message, type = 'floating' }) => {
  if (!message) return null;

  const className = type === 'floating' ? 'floating-error' : 'form-error';

  return (
    <div className={className}>
      {message}
    </div>
  );
};

export default ShowErrorLabel;
