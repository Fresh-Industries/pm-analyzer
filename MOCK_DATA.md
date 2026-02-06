# PM Analyzer Mock Data

Paste this into the feedback form, one at a time or in bulk:

---

## Bug Reports (Type: 🐛 Bug Report)

1. "The dashboard takes forever to load when I have more than 50 bounces booked. Sometimes it just times out."

2. "Dark mode hurts my eyes at night, the contrast is way too harsh."

3. "I can't export my bookings to PDF anymore. It just shows a blank page."

4. "The calendar view is broken on mobile Safari, I can't switch between months."

5. "Customer emails aren't sending when I confirm a booking. Lost 2 customers last week."

6. "The search function doesn't find customers by phone number, only by name."

7. "Adding photos to a booking crashes the app on iPhone."

8. "Prices are showing wrong on the website widget, showing $50 instead of $75."

9. "My dashboard shows 12 bookings but the calendar only shows 8. Syncing issue?"

10. "Text message reminders are going out at the wrong time. Customer complained."

---

## Feature Requests (Type: 💡 Feature Request)

1. "Please add dark mode! My eyes hurt when I book parties at night."

2. "Would love to see weekly revenue charts on the dashboard."

3. "Need a way to bulk update prices for all my bounce houses."

4. "Please integrate with QuickBooks so I don't have to enter invoices manually."

5. "Would be great to send automatic reminders 24 hours before a booking."

6. "Need SMS notifications, email isn't working for half my customers."

7. "Want a mobile app so I can manage bookings from my phone."

8. "Please add a 'weather delay' button that auto-notifies customers."

9. "Would love customer reviews to be automatically sent after events."

10. "Need a way to track which marketing source brings the most bookings."

---

## How to Test

**Option 1: Paste one by one**
1. Go to `/projects/[id]/feedback/new`
2. Select Type (Bug or Feature)
3. Select Customer Tier (mix of Free/Pro/Enterprise)
4. Paste the text
5. Click Submit

**Option 2: Bulk test**
1. Add 5-10 items
2. Go to project page
3. Click "Analyze"
4. See how it groups them!

**What to look for:**
- ✅ Should group "dark mode" requests together
- ✅ Should group "mobile/Safari" issues together  
- ✅ Should group "SMS/email notifications" together
- ✅ Enterprise bugs should score higher
- ✅ Decision form should auto-fill from analysis
