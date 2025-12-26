-- Check if contacts are being saved to the database
-- Run these queries on your Render database

-- 1. Check total user_contacts for your user
SELECT COUNT(*) as total_contacts 
FROM user_contacts 
WHERE user_id = <YOUR_USER_ID>;

-- 2. View all contacts for your user
SELECT id, name, phone, email, created_at 
FROM user_contacts 
WHERE user_id = <YOUR_USER_ID>
ORDER BY created_at DESC;

-- 3. Check if guests are being linked to contacts
SELECT 
    g.id as guest_id,
    g.name as guest_name,
    g.phone as guest_phone,
    g.contact_id,
    c.name as contact_name,
    c.phone as contact_phone
FROM guests g
LEFT JOIN user_contacts c ON g.contact_id = c.id
WHERE g.event_id IN (
    SELECT id FROM events WHERE user_id = <YOUR_USER_ID>
)
ORDER BY g.created_at DESC
LIMIT 20;

-- 4. Find your user_id (if you don't know it)
SELECT id, email, name 
FROM users 
WHERE email = '<YOUR_EMAIL>';

-- 5. Check for any user_contacts violations or errors
SELECT * 
FROM user_contacts 
WHERE user_id = <YOUR_USER_ID>
AND phone IS NULL 
AND email IS NULL;  -- Should return 0 rows (constraint violation)

-- 6. Count guests with and without contact links
SELECT 
    COUNT(*) as total_guests,
    COUNT(contact_id) as guests_with_contacts,
    COUNT(*) - COUNT(contact_id) as guests_without_contacts
FROM guests g
JOIN events e ON g.event_id = e.id
WHERE e.user_id = <YOUR_USER_ID>;
