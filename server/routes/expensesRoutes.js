const express = require('express');
const router = express.Router();
const Expenses = require('../models/expenses.js');

// Define expenses-related routes here

router.get('/all', async (req, res) => {
    try {
      const allExpenses = await Expenses.find();
      res.json(allExpenses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
router.get('/show/:expenseId', async (req, res) => {
    try {
      const expenseId = parseInt(req.params.expenseId);
  
      const expense = await Expenses.findOne({ expense_id: expenseId });
      console.log(expenseId, expense)
  
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
  
      res.json(expense);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
module.exports = router;