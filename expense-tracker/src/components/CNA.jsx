// src/components/CNA.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import '../css/login.css';
import ShowErrorLabel from './ShowErrorLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { signInWithPopup } from 'firebase/auth';
import { provider } from '../firebase';


const CNA = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      navigate('/home');
    } catch (err) {
      console.error(err.message);
      setError('Account creation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign-In success:', result.user);
      navigate('/home');
    } catch (err) {
      console.error(err.message);
      setError('Google Sign-In failed. Try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      <form onSubmit={handleCreateAccount} className="login-card">
        {/* Icon */}
        <div className="login-icon">
          <FontAwesomeIcon icon={faUserPlus} />
        </div>

        <h2>Create Your Account</h2>
        <p className="login-subtext">Let's get you started! Fill the details below</p>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          className="login-input"
        />

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

        {error && <ShowErrorLabel message={error} isError={true} />}

        <button type="submit" className="login-button">
          Create Account
        </button>

        <button type="button" className="login-button google-btn" onClick={handleGoogleSignIn}>
          <FontAwesomeIcon icon={faGoogle} style={{ marginRight: '-2px' }} />
            Sign Up with Google
        </button>

        <div className="login-footer">
          Already have an account?
          <Link to="/login"> Log in</Link>
        </div>
      </form>
    </div>
  );
};

export default CNA;
