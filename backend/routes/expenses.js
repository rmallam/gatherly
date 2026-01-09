import express from 'express';
import { authMiddleware } from '../server/auth.js';
import {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getBalances,
    recordSettlement,
    getExpenseSummary
} from '../controllers/expenseController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Summary and reports
router.get('/events/:eventId/expenses/summary', getExpenseSummary);

// Expense CRUD
router.post('/events/:eventId/expenses', createExpense);
router.get('/events/:eventId/expenses', getExpenses);
router.get('/events/:eventId/expenses/:expenseId', getExpense);
router.put('/events/:eventId/expenses/:expenseId', updateExpense);
router.delete('/events/:eventId/expenses/:expenseId', deleteExpense);

export default router;
