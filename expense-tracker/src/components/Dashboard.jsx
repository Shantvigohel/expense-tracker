// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faWallet, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { auth, db } from '../firebase';
import '../css/dashboard.css';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpensePopup, setShowExpensePopup] = useState(false);

  const today = new Date();
  const currentMonthLabel = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();

  // Fetch expenses from Firestore
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

  // Fetch budget and savings from Firestore
  useEffect(() => {
    if (!user || authLoading) return;

    const fetchBudgetAndSavings = async () => {
      try {
        const budgetDocRef = doc(db, 'users', user.uid, 'info', 'main');
        const budgetSnap = await getDoc(budgetDocRef);

        if (budgetSnap.exists()) {
          const data = budgetSnap.data();

          // normalize and fallback: check both 'savingGoal' (used in Budgets.jsx)
          // and 'savings' (in case older docs used that field)
          const budgetValue = parseFloat(data.budget ?? 0) || 0;
          const savingsValue =
            parseFloat(
              // prefer savingGoal, fall back to savings, else 0
              (data.savingGoal ?? data.savings ?? 0)
            ) || 0;

          const adjustedBudget = budgetValue - savingsValue;

          setBudget(adjustedBudget);
        } else {
          setBudget(0);
        }
      } catch (err) {
        console.error('Error fetching budget & savings:', err);
        setBudget(0);
      }
    };

    fetchBudgetAndSavings();
  }, [user, authLoading]);




  // Calculate total expenses for current month
  const getCurrentMonthExpenses = () => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return expenses.filter((expense) => {
      const expenseDate = expense.date ? new Date(expense.date) : new Date(expense.createdAt);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  };

  const currentMonthExpenses = getCurrentMonthExpenses();
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetUsage = budget > 0 ? (totalExpenses / budget) * 100 : 0;

  // Calculate daily average spending
  const getDailyAverage = () => {
    if (currentMonthExpenses.length === 0) return 0;
    const currentDay = today.getDate();
    return totalExpenses / currentDay;
  };

  const getRemainingBudget = () => Math.max(0, budget - totalExpenses);

  const dailyAverage = getDailyAverage();
  const remainingBudget = getRemainingBudget();

  const formatAmount = (amount) => `₹${Number(amount).toFixed(2)}`;

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

  const formatDate = (value) => {
    if (!value) return 'Unknown date';
    const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense);
    setShowExpensePopup(true);
  };

  const closeExpensePopup = () => {
    setShowExpensePopup(false);
    setSelectedExpense(null);
  };

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="dashboard-section">
      {/* Heading */}
      <h2 className="dashboard-heading">Dashboard</h2>
      <p className="dashboard-subtext">Overview of your monthly expenses</p>

      {/* Monthly Summary Box */}
      <div className="dashboard-box summary-box">
        <div className="summary-content">
          <div className="summary-left">
            <h3 className="summary-title">Monthly Expenses</h3>
            <p className="summary-month">{currentMonthLabel} {currentYear}</p>
            <div className="budget-progress">
              <span
                className="progress-text"
                style={{
                  color: budgetUsage >= 100 ? "#ff4554" : "var(--color-text-dark)"
                }}
              >
                {budgetUsage >= 100
                  ? "No budget remaining"
                  : `${budgetUsage.toFixed(0)}% of budget used`}
              </span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(budgetUsage, 100)}%`,
                    background:
                      budgetUsage >= 100
                        ? "#ff4554"
                        : "linear-gradient(90deg, var(--color-blue-muted) 0%, var(--color-blue-light) 100%)"
                  }}
                ></div>
              </div>
              <span className="budget-amount">Budget: {formatAmount(budget)}</span>
            </div>



          </div>
          <div className="summary-right">
            <span className="total-expenses-amount">{formatAmount(totalExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Stats Row: 3 boxes */}
      <div className="dashboard-row">
        <div className="dashboard-box stat-box">
          <div className="stat-content">
            <div className="stat-left">
              <h4 className="stat-title">Total Expenses</h4>
              <span className="stat-amount">{formatAmount(totalExpenses)}</span>
            </div>
            <div className="stat-icon stat-icon-pink">
              <FontAwesomeIcon icon={faChartLine} className="icon-chart" />
            </div>
          </div>
        </div>
        <div className="dashboard-box stat-box">
          <div className="stat-content">
            <div className="stat-left">
              <h4 className="stat-title">Daily Average</h4>
              <span className="stat-amount">{formatAmount(dailyAverage)}</span>
            </div>
            <div className="stat-icon stat-icon-blue">
              <FontAwesomeIcon icon={faCalendar} className="icon-calendar" />
            </div>
          </div>
        </div>
        <div className="dashboard-box stat-box">
          <div className="stat-content">
            <div className="stat-left">
              <h4 className="stat-title">Remaining Budget</h4>
              <span className="stat-amount">{formatAmount(remainingBudget)}</span>
            </div>
            <div className="stat-icon stat-icon-grey">
              <FontAwesomeIcon icon={faWallet} className="icon-wallet" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses Section */}
      <div className="dashboard-box recent-box">
        <h3 className="expenses-title">Recent Expenses</h3>
        <div className="expenses-list">
          {loading ? (
            <div className="loading">Loading expenses...</div>
          ) : recentExpenses.length === 0 ? (
            <div className="no-expenses">No expenses found</div>
          ) : (
            recentExpenses.map((item) => (
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

      {/* Expense Details Popup (same as Budgets.jsx) */}
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
              <button className="expense-popup-close-btn" onClick={closeExpensePopup}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
