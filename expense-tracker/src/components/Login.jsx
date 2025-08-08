// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword,
         signInWithPopup, 
         sendPasswordResetEmail, 
         setPersistence, 
         browserLocalPersistence, 
         browserSessionPersistence,
         onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import ShowErrorLabel from './ShowErrorLabel';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { provider } from '../firebase';
import '../css/login.css';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  const navigate = useNavigate();

  // auto login useEffect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAutoLoggingIn(true); 
        setInfoMessage('Auto-login successful');

        setTimeout(() => {
          navigate('/home');
        }, 1000);
      }
    });
    return () => unsubscribe();
  }, []);

  // remember me useEffect
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberMeEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true); 
    }
  }, []);

  // forgot password
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetMessage('Please enter your email.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Check your inbox for reset instructions.');

      setTimeout(() => {
      setShowResetPopup(false);
      setResetEmail('');
      setResetMessage('');
      }, 1000);

    } catch (err) {
      console.error('Reset error:', err.code, err.message);
      setResetMessage('Failed to send reset email. Try again.');
    }
  };

  //handleLogin 
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {

      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        localStorage.setItem('rememberMeEmail', email);
      } else {
        localStorage.removeItem('rememberMeEmail');
      }

      navigate('/home');

    } catch (err) {
      console.error(err.message);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  //handleGoogleSignIn 
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (err) {
      console.error('Google Sign-In error:', err.code);

      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        // Don't show error to user — they just closed or interrupted the popup
        return;
      }

      setError('Google Sign-In failed. Try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-card">


        <div className="login-icon">
          <FontAwesomeIcon icon={faUserGroup} />
        </div>

        <h2>Login to Your Account</h2>
        <p className="login-subtext">Welcome back! Please enter your details</p>


        <div className="login-messages">
          {error && <ShowErrorLabel message={error} />}
            {infoMessage && (
            <ShowErrorLabel
              message={infoMessage}
              type={infoMessage === 'Auto-login successful' ? 'inline' : 'floating'}
            />
          )}
        </div>

        {!isAutoLoggingIn && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              className="login-input"
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="login-input"
            />

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <span className="forgot-password" onClick={() => setShowResetPopup(true)}>
                Forgot password?
              </span>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

            <button type="button" className="login-button google-btn" onClick={handleGoogleSignIn}>
              <FontAwesomeIcon icon={faGoogle} style={{ marginRight: '-2px' }} />
              Continue with Google
            </button>

            <div className="login-footer">
              Don't have an account? <Link to="/create-account">Create one</Link>
            </div>
          </>
        )}
      </form>


      {showResetPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>Reset Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                setResetMessage('');
              }}
              className="login-input"
              style={{ width: '100%' }}
            />

            {resetMessage && <ShowErrorLabel message={resetMessage} />}

            <div className="popup-actions">
              <button className="login-button" onClick={handlePasswordReset}>
                Send Reset Link
              </button>
              <button className="login-button" onClick={() => {
                setShowResetPopup(false);
                setResetEmail('');
                setResetMessage('');
              }}>
                Cancel
              </button>
            </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default Login;