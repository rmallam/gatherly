/**
 * CSV Export utilities for Gatherly
 * Export guest lists with RSVP and check-in data
 */

/**
 * Convert guest data to CSV format
 */
const convertToCSV = (data) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                const escaped = String(value).replace(/"/g, '""');
                return escaped.includes(',') ? `"${escaped}"` : escaped;
            }).join(',')
        )
    ];

    return csvRows.join('\n');
};

/**
 * Trigger CSV file download
 */
const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Export all guests from an event
 */
export const exportAllGuests = (event) => {
    if (!event || !event.guests || event.guests.length === 0) {
        alert('No guests to export');
        return;
    }

    const guestData = event.guests.map(guest => ({
        'Name': guest.name,
        'Phone': guest.phone || 'N/A',
        'RSVP Status': guest.rsvp === true ? 'Confirmed' : guest.rsvp === false ? 'Declined' : 'No Response',
        'Checked In': guest.attended ? 'Yes' : 'No',
        'Times Checked In': guest.attendedCount || 0,
        'Added Date': new Date(guest.addedAt).toLocaleDateString(),
        'Added Time': new Date(guest.addedAt).toLocaleTimeString()
    }));

    const csv = convertToCSV(guestData);
    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_all_guests_${new Date().toISOString().split('T')[0]}.csv`;

    downloadCSV(csv, filename);
};

/**
 * Export only checked-in guests
 */
export const exportCheckedInGuests = (event) => {
    if (!event || !event.guests) {
        alert('No guests to export');
        return;
    }

    const checkedInGuests = event.guests.filter(g => g.attended);

    if (checkedInGuests.length === 0) {
        alert('No checked-in guests to export');
        return;
    }

    const guestData = checkedInGuests.map(guest => ({
        'Name': guest.name,
        'Phone': guest.phone || 'N/A',
        'Times Checked In': guest.attendedCount || 1,
        'RSVP Status': guest.rsvp === true ? 'Confirmed' : guest.rsvp === false ? 'Declined' : 'No Response',
        'Added Date': new Date(guest.addedAt).toLocaleDateString(),
        'Check-in Time': new Date(guest.lastAttendedAt || guest.addedAt).toLocaleTimeString()
    }));

    const csv = convertToCSV(guestData);
    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_checked_in_${new Date().toISOString().split('T')[0]}.csv`;

    downloadCSV(csv, filename);
};

/**
 * Export RSVP summary
 */
export const exportRSVPSummary = (event) => {
    if (!event || !event.guests) {
        alert('No data to export');
        return;
    }

    const confirmed = event.guests.filter(g => g.rsvp === true).length;
    const declined = event.guests.filter(g => g.rsvp === false).length;
    const pending = event.guests.filter(g => g.rsvp === null || g.rsvp === undefined).length;
    const checkedIn = event.guests.filter(g => g.attended).length;

    const summaryData = [
        { 'Metric': 'Total Guests', 'Count': event.guests.length },
        { 'Metric': 'RSVP Confirmed', 'Count': confirmed },
        { 'Metric': 'RSVP Declined', 'Count': declined },
        { 'Metric': 'No Response', 'Count': pending },
        { 'Metric': 'Checked In', 'Count': checkedIn },
        { 'Metric': 'Response Rate', 'Count': `${Math.round(((confirmed + declined) / event.guests.length) * 100)}%` },
        { 'Metric': 'Check-in Rate', 'Count': `${Math.round((checkedIn / event.guests.length) * 100)}%` }
    ];

    const csv = convertToCSV(summaryData);
    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_summary_${new Date().toISOString().split('T')[0]}.csv`;

    downloadCSV(csv, filename);
};
