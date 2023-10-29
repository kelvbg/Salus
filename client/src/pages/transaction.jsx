import React, { useEffect, useState } from 'react';
import "../styles/transactions.css";
import axios from 'axios';
import { useAuth } from '../AuthContext'; 
import { local } from 'd3';

function Transaction() {

  const { currentUser, isLoading: authLoading } = useAuth();  // get isLoading state from AuthContext
  const userId = localStorage?.userId;
  
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    if (authLoading) return; // Return early if still determining auth status

    const token = localStorage.getItem('authToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

    const fetchIncome = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/income/show/' + userId);
        setIncome(response.data);
      } catch (err) {
        console.error("Error fetching income:", err);
      }
    };

    const fetchExpense = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/expense/show/' + userId);
        setExpense(response.data);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };

    fetchIncome();
    fetchExpense();
  }, [userId, authLoading]); // Add authLoading to dependency list

  const handleToggleChange = () => {
    setToggle(!toggle);
  };

  // Only works on Chrome
  document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.bothTables');
    container.addEventListener('scroll', function() {
      if (container.scrollTop <= 0) {
        // Prevent scrolling above the top
        container.scrollTop = 0;
      } else if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
        // Prevent scrolling below the bottom
        container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    });
  });

  const sortIncomeByDate = () => {
    const sortedIncomeByDate = [...income].sort((a, b) => new Date(a.date) - new Date(b.date));
    setIncome(sortedIncomeByDate);
  };

  const sortExpenseByDate = () => {
    const sortedExpenseByDate = [...expense].sort((a, b) => new Date(a.date) - new Date(b.date));
    setExpense(sortedExpenseByDate);
  };

  const sortIncomeByDateDescending = () => {
    const sortedIncomeByDateDescending = [...income].sort((a, b) => new Date(b.date) - new Date(a.date));
    setIncome(sortedIncomeByDateDescending);
  };
  
  const sortExpenseByDateDescending = () => {
    const sortedExpenseByDateDescending = [...expense].sort((a, b) => new Date(b.date) - new Date(a.date));
    setExpense(sortedExpenseByDateDescending);
  };

  const sortIncomeByAmount = () => {
    const sortedIncomeByAmount = [...income].sort((a, b) => a.amount - b.amount);
    setIncome(sortedIncomeByAmount);
  };

  const sortExpenseByAmount = () => {
    const sortedExpenseByAmount = [...expense].sort((a, b) => a.amount - b.amount);
    setExpense(sortedExpenseByAmount);
  };

  const sortIncomeByAmountDescending = () => {
    const sortedIncomeByAmountDescending = [...income].sort((a, b) => b.amount - a.amount);
    setIncome(sortedIncomeByAmountDescending);
  };
  
  const sortExpenseByAmountDescending = () => {
    const sortedExpenseByAmountDescending = [...expense].sort((a, b) => b.amount - a.amount);
    setExpense(sortedExpenseByAmountDescending);
  };

  const sortExpenseByCategory = () => {
    const sortedExpenseByCategory = [...expense].sort((a, b) => a.category_name.localeCompare(b.category_id));
    setExpense(sortedExpenseByCategory);
  };
  
  const sortExpenseByCategoryDescending = () => {
    const sortedExpenseByCategoryDescending = [...expense].sort((a, b) => b.category_name.localeCompare(a.category_id));
    setExpense(sortedExpenseByCategoryDescending);
  };

  return (
    <div>
      <button className="toggle-button" onClick={handleToggleChange}>
        {toggle ? "Show Expenses" : "Show Income"}
      </button>
      <div className="bothTables">
        {toggle ? (
          <table className = "incomeTable">
          <thead>
            <tr>
              <th>Date
                  <button className = "headButton" onClick={sortIncomeByDate}>↑</button>
                  <button className = "headButton" onClick={sortIncomeByDateDescending}>↓</button>
              </th>
              <th>Amount
                  <button className = "headButton" onClick={sortIncomeByAmount}>↑</button>
                  <button className = "headButton" onClick={sortIncomeByAmountDescending}>↓</button>
              </th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {
              income.map(income => {
                return <tr key={income.id}>
                  <td>{income.date}</td>
                  <td>${income.amount}</td>
                  <td>{income.source}</td>
                </tr>
              })
            }
          </tbody>
        </table>
        ) : (
          <table className="expenseTable">
            <thead>
              <tr>
                <th>Date
                    <button className = "headButton" onClick={sortExpenseByDate}>↑</button>
                    <button className = "headButton" onClick={sortExpenseByDateDescending}>↓</button>
                </th>
                <th>Amount
                    <button className = "headButton" onClick={sortExpenseByAmount}>↑</button>
                    <button className = "headButton" onClick={sortExpenseByAmountDescending}>↓</button>
                </th>
                <th>Category
                    <button className = "headButton" onClick={sortExpenseByCategory}>↑</button>
                    <button className = "headButton" onClick={sortExpenseByCategoryDescending}>↓</button>
                </th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {
                expense.map(expense => (
                  <tr key={expense.id}>
                    <td>{expense.date}</td>
                    <td>${expense.amount}</td>
                    <td>{expense.category_name}</td>
                    <td>{expense.description}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Transaction;
