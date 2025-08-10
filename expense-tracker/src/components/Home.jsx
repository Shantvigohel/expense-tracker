import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import ShowErrorLabel from './ShowErrorLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPlus, faBullseye, faGear, faRightFromBracket, faBars, faWallet } from '@fortawesome/free-solid-svg-icons';
import Dashboard from './Dashboard';
import AddExpense from './AddExpense';
import Budgets from './Budgets';
import Settings from './Settings';
import '../css/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // default to dashboard

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="home-container">
      {error && <ShowErrorLabel message={error} type="floating" />}

      {/* Hamburger Icon */}
      <FontAwesomeIcon icon={faBars} className="hamburger-icon" onClick={toggleSidebar} />
      
      {/* Mobile App Name - removed as requested */}

      {/* Overlay - only show when sidebar is open on mobile */}
      {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2 className="app-name">ExpenseTracker</h2>

        <div className="nav-items">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <FontAwesomeIcon icon={faHouse} className="nav-icon" />
            <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'add-expense' ? 'active' : ''}`} onClick={() => setActiveTab('add-expense')}>
            <FontAwesomeIcon icon={faPlus} className="nav-icon" />
            <span>Add Expense</span>
          </div>
          <div className={`nav-item ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => setActiveTab('budgets')}>
            <FontAwesomeIcon icon={faBullseye} className="nav-icon" />
            <span>Budgets & Goals</span>
          </div>
          <div className={`nav-item ${activeTab === 'setting' ? 'active' : ''}`} onClick={() => setActiveTab('setting')}>
            <FontAwesomeIcon icon={faGear} className="nav-icon" />
            <span>Settings</span>
          </div>
        </div>
        <div className="logout-section" onClick={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} className="nav-icon" />
          <span>Logout</span>
        </div>
      </div>

      {/* Content area */}
      <div className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'add-expense' && <AddExpense />}
        {activeTab === 'budgets' && <Budgets />}
        {activeTab === 'setting' && <Settings />}
      </div>
    </div>
  );
};

export default Home;