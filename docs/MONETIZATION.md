# Gatherly - Monetization Strategy

Complete guide to monetizing your event management app.

---

## 💰 Business Model: Freemium + SMS Credits

The recommended approach combines a free tier with paid premium features and pay-per-use SMS credits.

---

## 📊 Pricing Tiers

### Free Tier (Starter)

**Perfect for:** Casual users, small personal events

**Limits:**
- 3 events per year
- 50 guests maximum per event
- Basic features only

**Included Features:**
- ✅ Event creation and management
- ✅ Guest list management
- ✅ QR code generation
- ✅ Manual check-in
- ✅ RSVP tracking
- ✅ Contact import
- ✅ Basic event details (venue, catering, tasks)

**Restrictions:**
- ❌ No SMS announcements
- ❌ No automated reminders
- ❌ No CSV export
- ❌ No budget analytics
- ❌ Shows "Powered by Gatherly" branding

---

### Pro Tier ($6.99/month or $59.99/year)

**Perfect for:** Regular event organizers, small businesses

**What's Included:**
- ✅ **Unlimited events**
- ✅ **Unlimited guests**
- ✅ **Budget tracker with analytics**
- ✅ **CSV/PDF export**
- ✅ **50 free SMS per month**
- ✅ **Task management**
- ✅ **Vendor management**
- ✅ **Custom event branding**

**Benefits:**
- Professional appearance
- Time-saving automation
- Detailed analytics
- Export capabilities

---

### Business Tier ($14.99/month or $139.99/year)

**Perfect for:** Professional event planners, corporate events, weddings

**Everything in Pro, plus:**
- ✅ **500 SMS per month included**
- ✅ **Team collaboration** (up to 3 co-hosts)
- ✅ **Priority support** (24-hour response)
- ✅ **Custom branding** (remove all Gatherly branding)
- ✅ **Advanced analytics**
- ✅ **API access** (future)
- ✅ **White-label option** (future)

---

## 💬 SMS Credits (Add-on for all tiers)

SMS messages cost money (via Twilio), so charge for them:

### Credit Packages:

| Package | Price | Cost per SMS |
|---------|-------|--------------|
| 100 SMS | $9.99 | $0.10 |
| 500 SMS | $39.99 | $0.08 |
| 1000 SMS | $69.99 | $0.07 |
| 5000 SMS | $299.99 | $0.06 |

**SMS Usage:**
- Announcements to guests
- Thank you messages
- RSVP reminders
- Day-before reminders
- Event-day notifications

**Why charge separately?**
- SMS has real costs (Twilio charges per message)
- Usage varies widely by event size
- Gives users control over spending
- Prevents abuse of unlimited messaging

---

## 🎯 Feature Comparison Matrix

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Events per year | 3 | Unlimited | Unlimited |
| Guests per event | 50 | Unlimited | Unlimited |
| QR Code Check-in | ✅ | ✅ | ✅ |
| RSVP Tracking | ✅ | ✅ | ✅ |
| Contact Import | ✅ | ✅ | ✅ |
| Budget Tracker | ❌ | ✅ | ✅ |
| SMS Announcements | ❌ | 50/mo | 500/mo |
| Automated Reminders | ❌ | ✅ | ✅ |
| CSV Export | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | Partial | Full |
| Team Collaboration | ❌ | ❌ | ✅ (3 co-hosts) |
| Priority Support | ❌ | ❌ | ✅ (24hr) |

---

## 💡 Why People Will Pay

### 1. SMS Communication ($$$)
- **Cost basis:** SMS costs you $0.04-0.06 per message via Twilio
- **Value:** Saves users hours of manual texting
- **Justification:** Real cost passed to user with markup
- **Target:** Weddings (200+ guests = $100+ value easily)

### 2. Time Savings
- Automated RSVP reminders
- Day-before event notifications
- Bulk announcements
- **Value:** 5+ hours saved per event

### 3. Professional Features
- Budget tracking and expense management
- Detailed analytics and reports
- CSV export for client records
- **Target:** Professional event planners

### 4. Scalability
- Unlimited events (vs 3/year free)
- Unlimited guests (vs 50 free)
- **Target:** Regular organizers, businesses

### 5. Data Export
- Client reporting requirements
- Tax documentation
- Historical records
- **Target:** Business users, professionals

---

## 🚀 Implementation Roadmap

### Phase 1: Basic Paywall (Week 1-2)

**Immediate Actions:**
1. Add event limit counter to free tier
2. Show "Upgrade" prompts when hitting limits
3. Create pricing page in app
4. Implement guest limit enforcement

**Technical:**
- Add `subscription_tier` to users table
- Add `event_count` tracking
- Create upgrade modal component

### Phase 2: Subscription System (Week 3-4)

**Integration:**
- Integrate **Stripe** for subscriptions
- Add subscription management page
- Implement trial period (7 days)
- Email receipts and confirmations

**Database:**
- Add subscriptions table
- Track billing cycles
- Store payment methods

### Phase 3: SMS Credits (Week 5-6)

**Features:**
- SMS credit balance tracking
- Credit purchase flow
- Usage analytics
- Low balance warnings

**Technical:**
- Add `sms_credits` to users table
- Deduct credits on send
- Credit purchase via Stripe

### Phase 4: Feature Gating (Week 7-8)

**Lock Premium Features:**
- Budget tracker (Pro+)
- CSV export (Pro+)
- Automated reminders (Pro+)
- Team collaboration (Business)
- Advanced analytics (Business)

---

## 💰 Revenue Projections

### Conservative Estimates:

**User Base Growth:**
- Month 1-3: 100 users (mostly free)
- Month 4-6: 500 users (10% convert to Pro)
- Month 7-12: 2,000 users (15% Pro, 2% Business)

**Monthly Revenue (Month 12):**
- Pro users: 300 × $6.99 = $2,097
- Business users: 40 × $14.99 = $599
- SMS credits: ~$500 (average)
- **Total: ~$3,200/month**

**Annual Revenue (Year 1):**
- ~$15,000 - $20,000

**Year 2 (with growth):**
- 10,000 users
- 20% conversion rate
- **~$100,000/year**

---

## 🎁 Alternative: One-Time Purchase

If subscriptions don't fit your audience:

**Option:** $19.99 lifetime license
- All features unlocked forever
- SMS credits purchased separately
- Good for occasional users

**Pros:**
- Lower barrier to entry
- Appeals to wedding/one-time planners
- Simpler pricing

**Cons:**
- No recurring revenue
- Less predictable income

---

## 🔥 Quick Wins (Start Here)

### Implement These First:

1. **Event limit (3 per year)** - Easy to enforce, drives upgrades
2. **Guest limit (50 per event)** - Hits power users
3. **SMS paywall** - Clear value, justifiable cost
4. **CSV export lock** - Professionals need this

### Messaging:

**Free tier limit reached:**
> "You've reached your limit of 3 events per year. Upgrade to Pro for unlimited events and advanced features. Only $6.99/month!"

**SMS prompt:**
> "Send announcements to all guests via SMS. Upgrade to Pro and get 50 free SMS per month, or purchase SMS credits."

---

## 📈 Pricing Psychology

### Annual Discount Strategy:
- Monthly: $6.99/month
- Annual: $59.99/year (save $24 = 28% off)
- **Result:** Most users choose annual

### Free Trial:
- 7-day Pro trial (no credit card required)
- Converts 25-40% of trial users

### Anchor Pricing:
- Show Business tier to make Pro look affordable
- "Most popular" badge on Pro tier

---

## 🛠️ Technical Requirements

### Database Schema:

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20);
ALTER TABLE users ADD COLUMN subscription_ends_at TIMESTAMP;
ALTER TABLE users ADD COLUMN sms_credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN event_count INTEGER DEFAULT 0;

-- New subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier VARCHAR(20),
  status VARCHAR(20),
  stripe_subscription_id VARCHAR(255),
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SMS usage tracking
CREATE TABLE sms_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  credits_used INTEGER,
  message_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Next Steps

1. Review pricing with potential users
2. Set up Stripe account
3. Implement basic paywall (event limits)
4. Add upgrade prompts to UI
5. Test subscription flow
6. Launch with limited feature set
7. Iterate based on feedback

---

**Ready to monetize? Start with the quick wins and iterate based on user feedback!** 🚀
