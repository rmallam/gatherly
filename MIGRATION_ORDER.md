# 🚨 **IMPORTANT: Migration Execution Order**

The following migrations **MUST** be run in order on your production database:

## Step 1: Event Social Wall (foundational)
```bash
# File: 20241219_event_social_wall.sql
```
**What it does:**
- Creates event_participants, event_posts, post_likes, post_comments tables
- Adds social_wall_enabled to events
- Adds profile fields to guests

## Step 2: Optional Email/Phone Signup ⚠️ **MUST RUN BEFORE STEP 3**
```bash
# File: 20241219_optional_email_phone_signup.sql
```
**What it does:**
- Adds phone column to users table
- Makes email column nullable in users table
- Adds constraint: must have email OR phone
- Creates unique indexes for both fields

## Step 3: Link Guests to Users
```bash
# File: 20241219_link_guests_to_users.sql  
```
**What it does:**
- Adds user_id column to guests table
- Auto-links existing guests to users via email/phone
- **DEPENDS ON:** users.phone column from Step 2

---

## Quick Copy-Paste for psql:

```bash
# Connect to your database
psql "your-database-connection-string"

# Run migrations in CORRECT order
\i backend/db/migrations/20241219_event_social_wall.sql
\i backend/db/migrations/20241219_optional_email_phone_signup.sql
\i backend/db/migrations/20241219_link_guests_to_users.sql
```

---

## What Happens After Migrations:

### Users Can:
1. **Sign up** with email OR phone (not both required)
2. **Login** with email OR phone + password
3. **See invited events** automatically (if guest record matches)
4. **Access event walls** for events they're invited to
5. **Post/like** on event walls

### Event Organizers Can:
- Enable social wall for events
- View all posts from guests
- Pin/delete posts
- See participant count

---

## Testing After Migration:

1. **Test Signup:**
   - Sign up with email only
   - Sign up with phone only (9876543210)
   - Sign up with both

2. **Test Auto-Linking:**
   - Create event as organizer
   - Add guest with email X
   - New user signs up with same email X
   - User should see invited event in "Events"

3. **Test Event Wall:**
   - Navigate to event
   - Click "Event Wall" button
   - Create post
   - Like post
   - All should work!

---

**Status:** Ready to deploy! 🚀
