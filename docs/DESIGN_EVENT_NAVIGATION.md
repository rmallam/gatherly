# Event Page - Icon-Based Grouped Navigation Design

## Concept: Two-Level Icon Navigation with Modal Popup

Similar to emoji keyboard - main categories always visible, subcategories appear in a modal popup when tapped.

---

## Main Screen (Default View)

```
┌─────────────────────────────────────┐
│  ← Birthday Party              ⋮   │
│  Dec 25, 2025 • My House            │
├─────────────────────────────────────┤
│                                     │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌────┐│
│  │ ℹ️  │  │ 📋  │  │ 💬  │  │ 💰 ││
│  │Event│  │Plan │  │Msgs │  │$$$ ││
│  │Info │  │ (7) │  │     │  │    ││
│  └─────┘  └─────┘  └─────┘  └────┘│
│                                     │
│  ┌─────────────────────────────────┤
│  │ Event Overview                  │
│  │                                 │
│  │ 📊 50 Guests                    │
│  │ ✅ 30 Attended                  │
│  │ 💵 Budget: $5000/$4200          │
│  │ 📝 8/12 Tasks Done              │
│  └─────────────────────────────────┤
└─────────────────────────────────────┘
```

### Main Category Icons:
- **ℹ️ Event Info** - Blue circle
- **📋 Planning (7)** - Purple circle with badge showing 7 sub-items
- **💬 Messages** - Green circle
- **💰 Finance** - Orange circle

---

## Expanded View (Planning Category Tapped)

```
┌─────────────────────────────────────┐
│  ← Birthday Party              ⋮   │
│  Dec 25, 2025 • My House            │
├─────────────────────────────────────┤
│ [DIMMED/BLURRED BACKGROUND]         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌────┐│
│  │ ℹ️  │  │[📋] │  │ 💬  │  │ 💰 ││ ← Active state
│  │Event│  │Plan │  │Msgs │  │$$$ ││
│  └─────┘  └─────┘  └─────┘  └────┘│
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║   ━━━ Planning Categories     ║ │ ← Handle bar
│  ╠═══════════════════════════════╣ │
│  ║                               ║ │
│  ║ ┌─────┐ ┌─────┐ ┌─────┐      ║ │
│  ║ │ 🍽️  │ │ ✅  │ │ 📍  │      ║ │
│  ║ │Cater│ │Tasks│ │Venue│      ║ │
│  ║ └─────┘ └─────┘ └─────┘      ║ │
│  ║                               ║ │
│  ║ ┌─────┐ ┌─────┐ ┌─────┐      ║ │
│  ║ │ 🎈  │ │ 🎁  │ │ 🎵  │      ║ │
│  ║ │Decor│ │Gifts│ │Music│      ║ │
│  ║ └─────┘ └─────┘ └─────┘      ║ │
│  ║                               ║ │
│  ║ ┌─────┐                       ║ │
│  ║ │ 💼  │                       ║ │
│  ║ │Vend │                       ║ │
│  ║ └─────┘                       ║ │
│  ║                               ║ │
│  ╚═══════════════════════════════╝ │
└─────────────────────────────────────┘
```

### Modal Features:
- **Bottom Sheet** slides up from bottom
- **Blurred background** (glassmorphism)
- **3-column grid** of icon cards
- **Handle bar** at top for swipe to dismiss
- **Large colorful icons** matching existing design
- **Rounded corners** and shadows

---

## Icon Mapping

### 📋 Planning Category (7 sub-items):
```
🍽️  Catering     - Pink/Red
✅  Tasks        - Blue
📍  Venue        - Purple
🎈  Decorations  - Orange
🎁  Gifts        - Red
🎵  Entertainment - Green
💼  Vendors      - Yellow
```

### ℹ️ Event Info Category:
```
📄  Overview     - Blue
📝  Details      - Indigo
🔲  QR Code      - Purple
```

### 💬 Messages Category:
```
📢  Announcements - Green
❤️  Thank You     - Pink
📜  History       - Gray
```

### 💰 Finance Category:
```
💵  Budget       - Green
📊  Expenses     - Orange
📈  Reports      - Blue
```

---

## Interaction Flow

1. **Default**: Main category icons visible in horizontal scrollable row
2. **Tap Icon**: Modal slides up showing subcategory icons in grid
3. **Tap Subcategory**: Navigate to that section, modal dismisses
4. **Swipe Down**: Dismiss modal, return to overview
5. **Tap Outside**: Dismiss modal

---

## Design Benefits

✅ **Visual Consistency** - Reuses all existing icons  
✅ **Familiar Pattern** - Like emoji keyboard, WhatsApp stickers  
✅ **Scalable** - Easy to add more categories/subcategories  
✅ **Clean UI** - Only 4 main icons visible, no clutter  
✅ **Quick Access** - 2 taps to reach any section  
✅ **Discoverable** - All options visible in modal  
✅ **Touch-Friendly** - Large icon targets  

---

## Technical Implementation Notes

### Components Needed:
1. **IconCategoryBar** - Horizontal scrollable main icons
2. **CategoryModal** - Bottom sheet with icon grid
3. **IconCard** - Reusable icon button component

### Animation:
- Modal slide-up: 300ms ease-out
- Background blur: Fade in 200ms
- Icon scale on press: 95% scale, 100ms

### Accessibility:
- Icons have text labels
- Support VoiceOver/TalkBack
- Keyboard navigation support
- Proper focus management

---

## Comparison with Original Tabs

### Before (Horizontal Tabs):
```
[Overview] [Guests] [Catering] [Tasks] [Venue] [Decor] → 
```
❌ 10+ tabs, scrolls horizontally, cluttered

### After (Icon Groups):
```
[📋 Plan] [💬 Msgs] [💰 $$]
```
✅ 4 main icons, clean, organized

---

**This design combines the grouped category concept with your existing icon-based visual language while using a familiar modal popup pattern!**
