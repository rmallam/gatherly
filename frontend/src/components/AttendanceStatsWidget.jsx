import React, { useState, useEffect } from 'react';
import { Users, UserCheck, TrendingUp } from 'lucide-react';

const AttendanceStatsWidget = ({ guests }) => {
    const [stats, setStats] = useState({
        totalInvited: 0,
        totalExpected: 0,
        guestsCheckedIn: 0,
        totalCheckedIn: 0,
        rsvpYes: 0
    });

    useEffect(() => {
        if (!guests || guests.length === 0) return;

        const totalInvited = guests.length;
        const totalExpected = guests.reduce((sum, g) => sum + (g.expected_party_size || 1), 0);
        const guestsCheckedIn = guests.filter(g => g.attended).length;
        const totalCheckedIn = guests
            .filter(g => g.attended)
            .reduce((sum, g) => sum + (g.actual_party_size || 1), 0);
        const rsvpYes = guests.filter(g => g.rsvp === true).length;

        setStats({
            totalInvited,
            totalExpected,
            guestsCheckedIn,
            totalCheckedIn,
            rsvpYes
        });
    }, [guests]);

    const attendanceRate = stats.totalExpected > 0
        ? Math.round((stats.totalCheckedIn / stats.totalExpected) * 100)
        : 0;

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border)'
        }}>
            <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                Attendance Overview
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem'
            }}>
                {/* Invited */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                    }}>
                        {stats.totalInvited}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Guests Invited
                    </div>
                </div>

                {/* Expected (with +1s) */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#3b82f6',
                        marginBottom: '0.25rem'
                    }}>
                        {stats.totalExpected}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Expected (with +1s)
                    </div>
                </div>

                {/* Checked In */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#10b981',
                        marginBottom: '0.25rem'
                    }}>
                        {stats.totalCheckedIn}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Checked In
                    </div>
                </div>

                {/* Attendance Rate */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: attendanceRate >= 80 ? '#10b981' : attendanceRate >= 50 ? '#f59e0b' : '#ef4444',
                        marginBottom: '0.25rem'
                    }}>
                        {attendanceRate}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Attendance Rate
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '1rem' }}>
                <div style={{
                    height: '8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(attendanceRate, 100)}%`,
                        background: attendanceRate >= 80 ? '#10b981' : attendanceRate >= 50 ? '#f59e0b' : '#ef4444',
                        transition: 'width 0.3s ease',
                        borderRadius: '999px'
                    }} />
                </div>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    marginTop: '0.5rem',
                    textAlign: 'center'
                }}>
                    {stats.guestsCheckedIn} of {stats.totalInvited} guests checked in • {stats.totalCheckedIn} total people
                </div>
            </div>
        </div>
    );
};

export default AttendanceStatsWidget;
