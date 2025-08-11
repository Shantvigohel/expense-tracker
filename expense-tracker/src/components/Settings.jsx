import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ShowErrorLabel from './ShowErrorLabel';
import '../css/setting.css';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('rememberMeEmail');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err.message);
      setError('Logout failed. Please try again.');
    }
  };

  return (
    <div className="settings-container">
      {error && <ShowErrorLabel message={error} type="floating" />}

      <div className="settings-card">
        <h2 className="settings-title">Settings</h2>

        {user ? (
          <div className="user-info">
            <p><strong>Username:</strong> {user.displayName || 'Not set'}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        ) : (
          <p>Loading user info...</p>
        )}

        <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
          Logout
        </button>
      </div>

      {/* Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button className="modal-btn yes" onClick={handleLogout}>Yes</button>
              <button className="modal-btn no" onClick={() => setShowLogoutConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
