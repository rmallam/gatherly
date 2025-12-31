# Release Notes - Version 5.1.0

**Release Date:** December 31, 2024  
**Version Code:** 51  
**Build Type:** Production

---

## 🎉 What's New

### 🗓️ Schedule & Itinerary for Shared Events
Plan your trips down to the minute with our new Schedule feature!

- **Daily Activity Planning** - Organize activities by date with a beautiful timeline view
- **Activity Details** - Add time, location, category, description, and estimated costs
- **Category Icons** - Visual categorization (Food, Transport, Accommodation, Activities, Entertainment)
- **Date Navigation** - Swipe through days with an intuitive horizontal date selector
- **Cost Tracking** - Track estimated costs for each activity
- **Easy Management** - Add, view, and delete activities with a tap

### 🎨 Trip-Focused Overview for Shared Events
Shared events now show trip-specific information instead of guest statistics:

- **Participant Count** - See how many people are joining the trip
- **Days Until Trip** - Countdown to your adventure
- **Trip Duration** - Total number of days for the trip
- **Event Header** - Beautiful display with date range and description

### 💰 Enhanced Budget Tab
Better expense tracking and visibility:

- **Total Expense Summary** - See total expenses at a glance with a highlighted row
- **Category Breakdown** - Visual breakdown of expenses by category
- **Auto-Aggregation** - Expenses from other tabs (Catering, Decorations, etc.) automatically included
- **Improved Layout** - Cleaner, more organized expense display

### 💸 Splitwise-Inspired Expenses UI
Complete redesign of the Expenses tab for better clarity:

- **Grouped by Month** - Expenses organized with monthly section headers
- **Color-Coded Amounts:**
  - 🟢 Green = "you lent" (money owed to you)
  - 🟠 Orange = "you borrowed" (you owe money)
  - ⚪ Gray = "not involved"
- **Simplified List Items** - Date, icon, description, and status at a glance
- **Tab Navigation** - Switch between Expenses and Balances views
- **Summary Banner** - Net balance displayed prominently at the top

### 👤 Profile Picture Enhancements
Better photo management:

- **Click to Enlarge** - Tap your profile picture to view it full-screen
- **Full-Screen Modal** - Beautiful dark overlay with close button
- **Hover Effects** - Subtle scale and shadow effects on desktop
- **Improved Cropping** - Better visual feedback during photo cropping

---

## 🔧 Improvements

### Access Control
- **Participant Access** - Shared event participants now get full access to all features (Schedule, Expenses, etc.)
- **Guest View** - Only host event guests see the limited guest view

### Data Handling
- **Budget Tab Fix** - Resolved "TypeError: B is not iterable" error
- **API Compatibility** - Better handling of different API response formats
- **Expense Display** - Fixed issues with expenses not appearing in Budget tab

### User Experience
- **Status Text** - "Not involved" only shows when user is actually not part of an expense
- **Better Navigation** - Improved routing for shared vs host events
- **Responsive Design** - Better mobile experience across all new features

---

## 🐛 Bug Fixes

- Fixed Budget tab crash when fetching expenses
- Fixed participant routing to show correct event view
- Fixed expense status text showing incorrectly
- Fixed profile picture cropping area confusion
- Resolved data structure compatibility issues

---

## 🎨 Design Updates

- Modern gradient backgrounds for important UI elements
- Improved color scheme for better readability
- Enhanced card layouts with better spacing
- Consistent icon usage across features
- Better visual hierarchy in lists and summaries

---

## 📱 Technical Details

- **Minimum Android Version:** 7.0 (API 24)
- **Target Android Version:** 14 (API 36)
- **Build Tools:** Gradle 8.13.0
- **Framework:** Capacitor 6.x with React

---

## 🚀 Getting Started with New Features

### For Shared Events:
1. Create or open a shared event
2. Navigate to the **Schedule** tab to plan activities
3. Use the **Overview** tab to see trip statistics
4. Track expenses in the **Expenses** tab with the new Splitwise-style UI

### For All Events:
1. Check the **Budget** tab for the new total expense summary
2. Click your profile picture to view it full-screen
3. Enjoy the cleaner, more organized expense views

---

## 📝 Notes

- The Schedule feature is only available for shared events
- All existing data is preserved and compatible with this update
- Profile pictures can be enlarged by tapping/clicking on them
- Expenses are now grouped by month for better organization

---

## 🙏 Feedback

We're constantly improving! If you have suggestions or encounter any issues, please reach out to our support team.

---

**Happy Planning! 🎊**
