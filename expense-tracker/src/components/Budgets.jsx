import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import '../css/Budgets.css';

const Budgets = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local-only monthly goals (we can persist later if needed)
  const [earningGoal, setEarningGoal] = useState(null);
  const [savingGoal, setSavingGoal] = useState(null);
  const [showEarningModal, setShowEarningModal] = useState(false);
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [earningAmount, setEarningAmount] = useState('');
  const [savingAmount, setSavingAmount] = useState('');

  const today = new Date();
  const currentMonthLabel = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();

  const [user, authLoading] = useAuthState(auth);

  useEffect(() => {
    if (authLoading) return;

    // If user is not yet available, keep loading until auth provides it.
    if (!user) return;

    setLoading(true);
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const getMs = (value) =>
          typeof value?.toMillis === 'function' ? value.toMillis() : new Date(value).getTime();

        const items = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => getMs(b.createdAt) - getMs(a.createdAt));
        setExpenses(items);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching expenses:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const formatAmount = (amount) => `$${Number(amount).toFixed(2)}`;

  const formatGoalAmount = (amount) => {
    const numeric = Number(amount);
    if (Number.isNaN(numeric)) return '$0k';
    return numeric >= 1000 ? `$${(numeric / 1000).toFixed(0)}k` : `$${numeric.toFixed(0)}`;
  };

  const formatRelativeDate = (value) => {
    if (!value) return 'Unknown date';

    const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
    const now = new Date();
    const yest = new Date();
    yest.setDate(now.getDate() - 1);

    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === yest.toDateString()) return 'Yesterday';

    const diffMs = Math.abs(now - date);
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  const handleSubmitEarning = () => {
    if (earningAmount === '') return;
    setEarningGoal(Number(earningAmount));
    setEarningAmount('');
    setShowEarningModal(false);
  };

  const handleSubmitSaving = () => {
    if (savingAmount === '') return;
    setSavingGoal(Number(savingAmount));
    setSavingAmount('');
    setShowSavingModal(false);
  };

  return (
    <div className="budgets-container">
      <div className="budgets-header">
        <h1>Budgets & Goals</h1>
        <p>Track of your monthly expenses</p>
      </div>

      <div className="budgets-content">
        {/* Earning Goal card */}
        <div className="goal-card">
          <div className="goal-content">
            <h3>Set the goal for the amount you want to earn this month</h3>
            <p className="goal-info">
              {currentMonthLabel} {currentYear} | amount: {earningGoal ? formatGoalAmount(earningGoal) : '$0k'}
            </p>
          </div>
          <button className="goal-button" onClick={() => setShowEarningModal(true)}>Goal</button>
        </div>

        {/* Saving Goal card */}
        <div className="goal-card">
          <div className="goal-content">
            <h3>Enter the amount you want to save this month</h3>
            <p className="goal-info">
              {currentMonthLabel} {currentYear} | amount: {savingGoal ? formatGoalAmount(savingGoal) : '$0k'}
            </p>
          </div>
          <button className="goal-button" onClick={() => setShowSavingModal(true)}>Goal</button>
        </div>

        {/* Expenses card */}
        <div className="expenses-card">
          <h3 className="expenses-title">Expenses</h3>
          {/* Fixed-height scroll area; style to overflow-y: auto in CSS later */}
          <div className="expenses-list">
            {loading ? (
              <div className="loading">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="no-expenses">No expenses found</div>
            ) : (
              expenses.map((item) => (
                <div key={item.id} className="expense-item">
                  <div className="expense-details">
                    <h4 className="expense-title">{item.title}</h4>
                    <p className="expense-meta">{item.category} • {formatRelativeDate(item.createdAt)}</p>
                  </div>
                  <div className="expense-amount">-{formatAmount(item.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Earning Goal Modal */}
      {showEarningModal && (
        <div className="modal-overlay" onClick={() => setShowEarningModal(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Set Earning Goal</h3>
            <p>Enter your earning goal for {currentMonthLabel} {currentYear}</p>
            <input
              type="number"
              className="modal-input"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              value={earningAmount}
              onChange={(e) => setEarningAmount(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowEarningModal(false)}>Cancel</button>
              <button className="modal-submit" onClick={handleSubmitEarning}>Set Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* Saving Goal Modal */}
      {showSavingModal && (
        <div className="modal-overlay" onClick={() => setShowSavingModal(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Set Saving Goal</h3>
            <p>Enter your saving goal for {currentMonthLabel} {currentYear}</p>
            <input
              type="number"
              className="modal-input"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              value={savingAmount}
              onChange={(e) => setSavingAmount(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowSavingModal(false)}>Cancel</button>
              <button className="modal-submit" onClick={handleSubmitSaving}>Set Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;