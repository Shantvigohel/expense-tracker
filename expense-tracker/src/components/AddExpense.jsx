import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import ShowErrorLabel from './ShowErrorLabel';
import CustomDropdown from './CustomDropdown';
import DatePicker from "./DatePicker";
import '../css/AddExpense.css';

const AddExpense = () => {
  const [form, setForm] = useState({
    title: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paymentMethod: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Food & Dining',
    'Transportation',
    'Health & Fitness',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Travel',
    'Education',
    'Other'
  ];

  const paymentMethods = ['Cash', 'Card', 'UPI', 'Other'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, category, amount, date } = form;

    if (!title || !category || !amount || !date) {
      setError(`Please fill in all required fields.`); // unique value each time
      setTimeout(() => setError(''), 2000);
      return;
    }


    const user = auth.currentUser;
    if (!user) {
      setError('User not logged in.');
      return;
    }

    try {
      await addDoc(collection(db, 'expenses'), {
        ...form,
        amount: parseFloat(form.amount),
        uid: user.uid,
        createdAt: new Date(),
      });

      setSuccess('Expense added successfully!');
      setForm({
        title: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        paymentMethod: '',
      });
    } catch (err) {
      console.error('Error adding expense:', err.message);
      setError('Failed to add expense. Try again.');
    }

    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 2000);
  };

  return (
    <div className="add-expense-container">
      <div className="expense-form-wrapper">
        <h2 className="expense-form-title">Add New Expense</h2>

        {error && <ShowErrorLabel message={error} type="floating" />}
        {success && <ShowErrorLabel message={success} type="floating" />}

        <form className="expense-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Expense Title"
            value={form.title}
            onChange={handleChange}
            className="expense-input"
          />

          <CustomDropdown
            label="Category"
            name="category"
            options={categories}
            value={form.category}
            onChange={handleDropdownChange}
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="expense-input"
            min="0"
            step="0.01"
          />

          <DatePicker
            selectedDate={form.date}
            onDateChange={(value) => setForm({ ...form, date: value })}
          />

          <textarea
            name="notes"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={handleChange}
            className="expense-input"
          />

          <CustomDropdown
            label="Payment Method (optional)"
            name="paymentMethod"
            options={paymentMethods}
            value={form.paymentMethod}
            onChange={handleDropdownChange}
          />

          <button type="submit" className="expense-submit-btn">
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;