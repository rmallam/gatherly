import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    'Venue': '#6366f1',
    'Catering': '#8b5cf6',
    'Decorations': '#ec4899',
    'Entertainment': '#f59e0b',
    'Photography': '#10b981',
    'Transportation': '#3b82f6',
    'Gifts': '#ef4444',
    'Vendors': '#14b8a6',
    'Misc': '#64748b'
};

const CategoryChart = ({ expenses, budget }) => {
    // Group expenses by category
    const categoryData = expenses.reduce((acc, expense) => {
        const category = expense.category || 'Misc';
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += parseFloat(expense.amount) || 0;
        return acc;
    }, {});

    // Convert to array for chart
    const chartData = Object.entries(categoryData)
        .map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            percentage: budget?.total_budget > 0
                ? ((value / budget.total_budget) * 100).toFixed(1)
                : 0
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    const formatCurrency = (value) => {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    background: 'var(--bg-primary)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {data.name}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        {formatCurrency(data.value)} ({data.percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                background: 'var(--bg-secondary)',
                borderRadius: '12px'
            }}>
                <p>No expense data to visualize yet.</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Add expenses to see category breakdown
                </p>
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
        }}>
            <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                📊 Spending by Category
            </h3>

            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.name] || COLORS['Misc']}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Category List */}
            <div style={{ marginTop: '24px' }}>
                {chartData.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: index < chartData.length - 1 ? '1px solid var(--border-color)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '3px',
                                    background: COLORS[item.name] || COLORS['Misc']
                                }}
                            />
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                {item.name}
                            </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                {formatCurrency(item.value)}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {item.percentage}% of budget
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryChart;
