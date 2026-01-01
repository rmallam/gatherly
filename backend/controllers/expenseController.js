import { query } from '../db/connection.js';

/**
 * Create a new expense
 */
export const createExpense = async (req, res) => {
    const { eventId } = req.params;
    const { amount, currency, description, category, paidBy, receiptUrl, expenseDate, splits } = req.body;
    const userId = req.user.id;

    console.log('Create expense request:', {
        eventId,
        amount,
        currency,
        description,
        category,
        paidBy,
        receiptUrl,
        expenseDate,
        splits,
        userId
    });

    try {
        // Verify user has access to event
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        // Validate required fields
        const missingFields = [];
        if (!amount) missingFields.push('amount');
        if (!description) missingFields.push('description');
        if (!paidBy) missingFields.push('paidBy');
        if (!splits || splits.length === 0) missingFields.push('splits');

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields, { amount, description, paidBy, splits: splits?.length });
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields,
                received: { amount, description, paidBy, splitsCount: splits?.length }
            });
        }

        // Validate splits sum equals amount
        const splitTotal = splits.reduce((sum, split) => sum + parseFloat(split.amount), 0);
        if (Math.abs(splitTotal - parseFloat(amount)) > 0.01) {
            return res.status(400).json({
                error: 'Split amounts must equal total amount',
                splitTotal,
                amount: parseFloat(amount)
            });
        }

        // Start transaction
        await query('BEGIN');

        try {
            // Create expense
            const expenseResult = await query(
                `INSERT INTO event_expenses (event_id, amount, currency, description, category, paid_by, receipt_url, expense_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [
                    eventId,
                    amount,
                    currency || 'USD',
                    description,
                    category || 'other',
                    paidBy,
                    receiptUrl || null,
                    expenseDate || new Date()
                ]
            );

            const expense = expenseResult.rows[0];

            // Create splits
            for (const split of splits) {
                await query(
                    `INSERT INTO event_expense_splits (expense_id, user_id, amount)
                     VALUES ($1, $2, $3)`,
                    [expense.id, split.userId, split.amount]
                );
            }

            await query('COMMIT');

            // Fetch complete expense with splits and user names
            const completeExpense = await getExpenseWithDetails(expense.id);
            res.status(201).json(completeExpense);
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
};

/**
 * Get all expenses for an event
 */
export const getExpenses = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;
    const { category, startDate, endDate } = req.query;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        // Build query with filters
        let queryText = `
            SELECT e.*, 
                   u.name as paid_by_name,
                   u.email as paid_by_email,
                   json_agg(
                       json_build_object(
                           'id', es.id,
                           'user_id', es.user_id,
                           'userName', us.name,
                           'amount', es.amount,
                           'settled', es.settled,
                           'settledAt', es.settled_at
                       ) ORDER BY us.name
                   ) as splits
            FROM event_expenses e
            JOIN users u ON e.paid_by = u.id
            LEFT JOIN event_expense_splits es ON e.id = es.expense_id
            LEFT JOIN users us ON es.user_id = us.id
            WHERE e.event_id = $1
        `;

        const params = [eventId];
        let paramCount = 1;

        if (category) {
            paramCount++;
            queryText += ` AND e.category = $${paramCount}`;
            params.push(category);
        }

        if (startDate) {
            paramCount++;
            queryText += ` AND e.expense_date >= $${paramCount}`;
            params.push(startDate);
        }

        if (endDate) {
            paramCount++;
            queryText += ` AND e.expense_date <= $${paramCount}`;
            params.push(endDate);
        }

        queryText += ` GROUP BY e.id, u.name, u.email ORDER BY e.expense_date DESC`;

        const result = await query(queryText, params);

        res.json({ expenses: result.rows });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

/**
 * Get expense by ID
 */
export const getExpense = async (req, res) => {
    const { eventId, expenseId } = req.params;
    const userId = req.user.id;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        const expense = await getExpenseWithDetails(expenseId);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json(expense);
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ error: 'Failed to fetch expense' });
    }
};

/**
 * Update expense
 */
export const updateExpense = async (req, res) => {
    const { eventId, expenseId } = req.params;
    const { amount, currency, description, category, receiptUrl, expenseDate, splits } = req.body;
    const userId = req.user.id;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        // Validate splits if provided
        if (splits && amount) {
            const splitTotal = splits.reduce((sum, split) => sum + parseFloat(split.amount), 0);
            if (Math.abs(splitTotal - parseFloat(amount)) > 0.01) {
                return res.status(400).json({ error: 'Split amounts must equal total amount' });
            }
        }

        await query('BEGIN');

        try {
            // Update expense
            const updateFields = [];
            const updateParams = [expenseId];
            let paramCount = 1;

            if (amount !== undefined) {
                paramCount++;
                updateFields.push(`amount = $${paramCount}`);
                updateParams.push(amount);
            }
            if (currency !== undefined) {
                paramCount++;
                updateFields.push(`currency = $${paramCount}`);
                updateParams.push(currency);
            }
            if (description !== undefined) {
                paramCount++;
                updateFields.push(`description = $${paramCount}`);
                updateParams.push(description);
            }
            if (category !== undefined) {
                paramCount++;
                updateFields.push(`category = $${paramCount}`);
                updateParams.push(category);
            }
            if (receiptUrl !== undefined) {
                paramCount++;
                updateFields.push(`receipt_url = $${paramCount}`);
                updateParams.push(receiptUrl);
            }
            if (expenseDate !== undefined) {
                paramCount++;
                updateFields.push(`expense_date = $${paramCount}`);
                updateParams.push(expenseDate);
            }

            if (updateFields.length > 0) {
                await query(
                    `UPDATE event_expenses SET ${updateFields.join(', ')} WHERE id = $1`,
                    updateParams
                );
            }

            // Update splits if provided
            if (splits) {
                // Delete existing splits
                await query('DELETE FROM event_expense_splits WHERE expense_id = $1', [expenseId]);

                // Create new splits
                for (const split of splits) {
                    await query(
                        `INSERT INTO event_expense_splits (expense_id, user_id, amount)
                         VALUES ($1, $2, $3)`,
                        [expenseId, split.userId, split.amount]
                    );
                }
            }

            await query('COMMIT');

            const updatedExpense = await getExpenseWithDetails(expenseId);
            res.json(updatedExpense);
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
};

/**
 * Delete expense
 */
export const deleteExpense = async (req, res) => {
    const { eventId, expenseId } = req.params;
    const userId = req.user.id;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        // Delete expense (splits will be deleted automatically due to CASCADE)
        const result = await query(
            'DELETE FROM event_expenses WHERE id = $1 AND event_id = $2 RETURNING id',
            [expenseId, eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};

/**
 * Calculate balances for an event (who owes whom)
 */
export const getBalances = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        // Get all unsettled splits with user details
        const splitsResult = await query(
            `SELECT es.user_id, es.amount, ee.paid_by, ee.currency,
                    u1.name as user_name, u2.name as paid_by_name
             FROM event_expense_splits es
             JOIN event_expenses ee ON es.expense_id = ee.id
             JOIN users u1 ON es.user_id = u1.id
             JOIN users u2 ON ee.paid_by = u2.id
             WHERE ee.event_id = $1 AND es.settled = FALSE`,
            [eventId]
        );

        // Calculate net balances
        const balances = calculateBalances(splitsResult.rows);

        // Get total expenses and user shares
        const summaryResult = await query(
            `SELECT 
                SUM(e.amount) as total_expenses,
                json_agg(DISTINCT jsonb_build_object(
                    'userId', u.id,
                    'userName', u.name,
                    'totalPaid', COALESCE((
                        SELECT SUM(ee.amount) FROM event_expenses ee
                        WHERE ee.event_id = $1 AND ee.paid_by = u.id
                    ), 0),
                    'totalOwed', COALESCE((
                        SELECT SUM(es2.amount) FROM event_expense_splits es2
                        JOIN event_expenses e2 ON es2.expense_id = e2.id
                        WHERE e2.event_id = $1 AND es2.user_id = u.id AND es2.settled = FALSE
                    ), 0)
                )) as user_summary
             FROM event_expenses e
             CROSS JOIN users u
             WHERE e.event_id = $1
             GROUP BY e.event_id`,
            [eventId]
        );

        res.json({
            balances,
            summary: summaryResult.rows[0] || { total_expenses: 0, user_summary: [] }
        });
    } catch (error) {
        console.error('Error calculating balances:', error);
        res.status(500).json({ error: 'Failed to calculate balances' });
    }
};

/**
 * Record a settlement (payment between users)
 */
export const recordSettlement = async (req, res) => {
    const { eventId } = req.params;
    const { fromUser, toUser, amount, currency, notes } = req.body;
    const userId = req.user.id;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        if (!fromUser || !toUser || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (fromUser === toUser) {
            return res.status(400).json({ error: 'Cannot settle with yourself' });
        }

        await query('BEGIN');

        try {
            // Record settlement
            const settlementResult = await query(
                `INSERT INTO event_settlements (event_id, from_user, to_user, amount, currency, notes)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [eventId, fromUser, toUser, amount, currency || 'USD', notes || null]
            );

            // Mark relevant splits as settled
            await query(
                `UPDATE event_expense_splits es
                 SET settled = TRUE, settled_at = CURRENT_TIMESTAMP
                 FROM event_expenses e
                 WHERE es.expense_id = e.id
                   AND e.event_id = $1
                   AND es.user_id = $2
                   AND e.paid_by = $3
                   AND es.settled = FALSE`,
                [eventId, fromUser, toUser]
            );

            await query('COMMIT');

            res.status(201).json(settlementResult.rows[0]);
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error recording settlement:', error);
        res.status(500).json({ error: 'Failed to record settlement' });
    }
};

/**
 * Get expense summary by category
 */
export const getExpenseSummary = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        const result = await query(
            `SELECT 
                category,
                COUNT(*) as count,
                SUM(amount) as total,
                currency
             FROM event_expenses
             WHERE event_id = $1
             GROUP BY category, currency
             ORDER BY total DESC`,
            [eventId]
        );

        res.json({ summary: result.rows });
    } catch (error) {
        console.error('Error fetching expense summary:', error);
        res.status(500).json({ error: 'Failed to fetch expense summary' });
    }
};

// Helper function to get expense with full details
async function getExpenseWithDetails(expenseId) {
    const result = await query(
        `SELECT e.*, 
                u.name as paid_by_name,
                u.email as paid_by_email,
                json_agg(
                    json_build_object(
                        'id', es.id,
                        'user_id', es.user_id,
                        'userName', us.name,
                        'amount', es.amount,
                        'settled', es.settled,
                        'settledAt', es.settled_at
                    ) ORDER BY us.name
                ) as splits
         FROM event_expenses e
         JOIN users u ON e.paid_by = u.id
         LEFT JOIN event_expense_splits es ON e.id = es.expense_id
         LEFT JOIN users us ON es.user_id = us.id
         WHERE e.id = $1
         GROUP BY e.id, u.name, u.email`,
        [expenseId]
    );

    return result.rows[0] || null;
}

// Helper function to calculate net balances
function calculateBalances(splits) {
    console.log('💰 Calculating balances from splits:', JSON.stringify(splits.map(s => ({ user_id: s.user_id, paid_by: s.paid_by, amount: s.amount }))));
    const balanceMap = new Map();

    // Calculate who owes whom
    splits.forEach(split => {
        if (split.user_id === split.paid_by) return; // Skip if user paid for themselves

        const key = `${split.user_id}-${split.paid_by}`;
        const reverseKey = `${split.paid_by}-${split.user_id}`;

        if (balanceMap.has(reverseKey)) {
            // Net out opposite debts
            const existing = balanceMap.get(reverseKey);
            const newAmount = existing.amount - split.amount;

            if (newAmount > 0.01) {
                balanceMap.set(reverseKey, { ...existing, amount: newAmount });
            } else if (newAmount < -0.01) {
                balanceMap.delete(reverseKey);
                balanceMap.set(key, {
                    fromUser: split.user_id,
                    fromUserName: split.user_name,
                    toUser: split.paid_by,
                    toUserName: split.paid_by_name,
                    amount: Math.abs(newAmount),
                    currency: split.currency
                });
            } else {
                balanceMap.delete(reverseKey);
            }
        } else {
            const existing = balanceMap.get(key);
            balanceMap.set(key, {
                fromUser: split.user_id,
                fromUserName: split.user_name,
                toUser: split.paid_by,
                toUserName: split.paid_by_name,
                amount: (existing?.amount || 0) + split.amount,
                currency: split.currency
            });
        }
    });

    const result = Array.from(balanceMap.values()).filter(b => b.amount > 0.01);
    console.log('💰 Final balances:', JSON.stringify(result));
    return result;
}
