import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import '../css/Budgets.css';

const Budgets = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [earningGoal, setEarningGoal] = useState(null);
  const [savingGoal, setSavingGoal] = useState(null);
  const [showEarningModal, setShowEarningModal] = useState(false);
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [earningAmount, setEarningAmount] = useState('');
  const [savingAmount, setSavingAmount] = useState('');

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpensePopup, setShowExpensePopup] = useState(false);

  // New: confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const today = new Date();
  const currentMonthLabel = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();

  const [user, authLoading] = useAuthState(auth);

  // Fetch user's budget & saving goal on mount
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchGoals = async () => {
      try {
        const infoRef = doc(db, 'users', user.uid, 'info', 'main');
        const infoSnap = await getDoc(infoRef);

        if (infoSnap.exists()) {
          const data = infoSnap.data();
          if (data.budget !== undefined) setEarningGoal(data.budget);
          if (data.savingGoal !== undefined) setSavingGoal(data.savingGoal);
        }
      } catch (err) {
        console.error('Error fetching user goals:', err);
      }
    };

    fetchGoals();
  }, [user, authLoading]);

  // Fetch user's expenses
  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    const expensesQuery = collection(db, 'users', user.uid, 'expenses');

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

  const formatAmount = (amount) => `₹${Number(amount).toFixed(2)}`;

  const formatGoalAmount = (amount) => {
    const numeric = Number(amount);
    if (Number.isNaN(numeric)) return '₹0k';
    return numeric >= 1000 ? `₹${(numeric / 1000).toFixed(0)}k` : `₹${numeric.toFixed(0)}`;
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

  const handleSubmitEarning = async () => {
    if (earningAmount === '') return;
    const budgetAmount = Number(earningAmount);
    setEarningGoal(budgetAmount);
    setEarningAmount('');
    setShowEarningModal(false);

    if (!user) return;

    try {
      const infoRef = doc(db, 'users', user.uid, 'info', 'main');
      await setDoc(infoRef, { budget: budgetAmount }, { merge: true });
    } catch (err) {
      console.error('Error saving budget:', err);
    }
  };

  const handleSubmitSaving = async () => {
    if (savingAmount === '') return;
    const savingValue = Number(savingAmount);
    setSavingGoal(savingValue);
    setSavingAmount('');
    setShowSavingModal(false);

    if (!user) return;

    try {
      const infoRef = doc(db, 'users', user.uid, 'info', 'main');
      await setDoc(infoRef, { savingGoal: savingValue }, { merge: true });
    } catch (err) {
      console.error('Error saving savingGoal:', err);
    }
  };

  const handleKeyPress = (e, submitFunction) => {
    if (e.key === 'Enter') {
      submitFunction();
    }
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      setShowEarningModal(false);
      setShowSavingModal(false);
      setShowExpensePopup(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense);
    setShowExpensePopup(true);
  };

  const closeExpensePopup = () => {
    setShowExpensePopup(false);
    setSelectedExpense(null);
  };

  // New: open delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // New: delete expense
  const confirmDeleteExpense = async () => {
    if (!user || !selectedExpense) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'expenses', selectedExpense.id));
      setShowDeleteConfirm(false);
      setShowExpensePopup(false);
      setSelectedExpense(null);
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Unknown date';

    const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <h3>Enter the budget for the month</h3>
            <p className="goal-info">
              {currentMonthLabel} {currentYear} | amount: {earningGoal ? formatGoalAmount(earningGoal) : '₹0k'}
            </p>
          </div>
          <button className="goal-button" onClick={() => setShowEarningModal(true)}>budget</button>
        </div>

        {/* Saving Goal card */}
        <div className="goal-card">
          <div className="goal-content">
            <h3>Enter the amount you want to save from the budget for the month</h3>
            <p className="goal-info">
              {currentMonthLabel} {currentYear} | amount: {savingGoal ? formatGoalAmount(savingGoal) : '₹0k'}
            </p>
          </div>
          <button className="goal-button" onClick={() => setShowSavingModal(true)}>savings</button>
        </div>

        {/* Expenses card */}
        <div className="expenses-card">
          <h3 className="expenses-title">Expenses</h3>
          <div className="expenses-list">
            {loading ? (
              <div className="loading">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="no-expenses">No expenses found</div>
            ) : (
              expenses.map((item) => (
                <div
                  key={item.id}
                  className="expense-item"
                  onClick={() => handleExpenseClick(item)}
                  style={{ cursor: 'pointer' }}
                >
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
              onKeyPress={(e) => handleKeyPress(e, handleSubmitEarning)}
              autoFocus
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
              onKeyPress={(e) => handleKeyPress(e, handleSubmitSaving)}
              autoFocus
            />
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowSavingModal(false)}>Cancel</button>
              <button className="modal-submit" onClick={handleSubmitSaving}>Set Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Details Popup */}
      {showExpensePopup && selectedExpense && (
        <div className="modal-overlay" onClick={closeExpensePopup}>
          <div className="expense-popup modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="expense-popup-header">
              <h3>{selectedExpense.title}</h3>
              <button className="expense-popup-close" onClick={closeExpensePopup}>×</button>
            </div>

            <div className="expense-popup-content">
              <div className="expense-popup-row">
                <span className="expense-popup-label">Category:</span>
                <span className="expense-popup-value">{selectedExpense.category}</span>
              </div>

              <div className="expense-popup-row">
                <span className="expense-popup-label">Amount:</span>
                <span className="expense-popup-amount">-{formatAmount(selectedExpense.amount)}</span>
              </div>

              <div className="expense-popup-row">
                <span className="expense-popup-label">Date:</span>
                <span className="expense-popup-value">{formatDate(selectedExpense.date)}</span>
              </div>

              {selectedExpense.paymentMethod && (
                <div className="expense-popup-row">
                  <span className="expense-popup-label">Payment Method:</span>
                  <span className="expense-popup-value">{selectedExpense.paymentMethod}</span>
                </div>
              )}

              {selectedExpense.notes && (
                <div className="expense-popup-row">
                  <span className="expense-popup-label">Notes:</span>
                  <span className="expense-popup-value expense-popup-notes">{selectedExpense.notes}</span>
                </div>
              )}

              <div className="expense-popup-row">
                <span className="expense-popup-label">Added:</span>
                <span className="expense-popup-value">{formatDate(selectedExpense.createdAt)}</span>
              </div>
            </div>

            <div className="expense-popup-footer">
              <button className="expense-popup-delete-btn" onClick={handleDeleteClick}>Delete</button>
              <button className="expense-popup-close-btn" onClick={closeExpensePopup}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal small" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this entry?</p>
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowDeleteConfirm(false)}>No</button>
              <button className="modal-submit" onClick={confirmDeleteExpense}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
