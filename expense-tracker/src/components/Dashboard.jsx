// Dashboard.jsx
import React from 'react';
import '../css/dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-section">
      {/* Heading */}
      <h2 className="dashboard-heading">Dashboard</h2>
      <p className="dashboard-subtext">Overview of your monthly expenses</p>

      {/* Monthly Summary Box */}
      <div className="dashboard-box summary-box">
        {/* Will add monthly expenses info here */}
      </div>

      {/* Stats Row: 3 boxes */}
      <div className="dashboard-row">
        <div className="dashboard-box stat-box">{/* Total Expenses */}</div>
        <div className="dashboard-box stat-box">{/* Daily Average */}</div>
        <div className="dashboard-box stat-box">{/* Remaining Budget */}</div>
      </div>

      {/* Recent Expenses Section */}
      <div className="dashboard-box recent-box">
        {/* Recent Expenses list will go here */}
      </div>
    </div>
  );
};

export default Dashboard;
