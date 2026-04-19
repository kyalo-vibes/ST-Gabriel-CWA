# ST. Gabriel CWA Management System — Demo Script

## Section A — Manual Pre-Demo Test Checklist

Run through every item the day before the presentation. Both the frontend (`npm run dev` on :3000) and backend (`cd backend && npm run start:dev` on :3001) must be running.

- [ ] Admin login (`admin@stgabriel.org` + admin password) succeeds and lands on Dashboard
- [ ] Dashboard KPI cards load: Total Members, Total Collected, Active Events, Outstanding Balance
- [ ] Dashboard charts render: monthly trends bar chart, Jumuia breakdown pie chart
- [ ] Members table loads all members; filter by Jumuia (e.g. "St. Peter") shows correct subset
- [ ] Pending Approvals card appears if any members are pending; Approve button works
- [ ] Member detail page loads (click any member name): Profile tab shows details, Contributions tab shows history
- [ ] Add Contribution: click "Add Contribution", fill form, submit — record appears in table instantly
- [ ] Add Expense: click "Add Expense", fill form, submit — record appears in Expenses tab
- [ ] Events page shows event cards with progress bars (% collected)
- [ ] Create Event: click "Create Event", fill "Easter Fundraiser", type Harambee, KES 1,000/member, All Jumuia, future due date → save → new card appears at 0%
- [ ] Event detail page opens: per-member payment table loads with Pending/Paid badges
- [ ] Mark as Paid: click "Mark as Paid" for a member → status updates to Paid, progress bar increases
- [ ] Close Event: click "Close Event" → event status changes to Closed
- [ ] WhatsApp status shows "connected" on Notifications page (green badge)
- [ ] Individual send: compose message, select "Individual Phones", pick "Test Members" group, send → WhatsApp messages arrive on test phone
- [ ] Group send: select the registered CWA group, compose message, send → message arrives in the group
- [ ] Debt Management page shows defaulters table with outstanding amounts per member
- [ ] Bulk reminder: select all defaulters, click "Send Reminder" → WhatsApp messages arrive
- [ ] Reports page charts render (bar, pie, line)
- [ ] PDF export: click "Export Report" → browser print dialog opens with clean print preview (no sidebar/navbar)
- [ ] Member login: logout admin, login with `monicah.wambui@gmail.com` (email only, no password field required on member tab)
- [ ] Member dashboard shows own balance and contribution history only
- [ ] Member dashboard does NOT show Members, Contributions, Events, Debt, or Settings nav items
- [ ] Logout works for both admin and member roles

---

## Section B — 8-Scene Demo Script (~12 minutes)

**Setup before the demo:**
- Both servers running (frontend :3000, backend :3001)
- WhatsApp connected (green badge on Notifications page)
- Test phone ready to receive WhatsApp messages
- Browser at `http://localhost:3000/login`

---

### Scene 1 — Admin Login (1 min)

**Click:** Admin tab → type `admin@stgabriel.org` → enter password → click Login

**Say:** "This is the admin login used by the CWA treasurer. The system has two types of users: the administrator who manages everything, and members who can view only their own records."

**Show:** Dashboard loads with live KPI cards (Total Members, Total Collected KES, Active Events, Outstanding Balance) and financial charts.

---

### Scene 2 — Member Management (2 min)

**Click:** Members in the sidebar

**Say:** "Here we can see all CWA members. We can filter by Jumuia to see sub-groups."

**Click:** Filter by Jumuia → select "St. Peter"

**Say:** "Only St. Peter members are shown. Let me open one member's full profile."

**Click:** Any member's name → Member Detail page

**Say:** "This page shows the member's personal details, their contribution history, and any notifications sent to them. The admin can also edit their information here."

---

### Scene 3 — Financial Records (2 min)

**Click:** Contributions in the sidebar

**Say:** "This is the finance page. We have income — member contributions — and expenses like welfare payments and administrative costs."

**Click:** "Add Contribution" button

**Say:** "Let me add a contribution now. I'll select a member, enter the amount, choose the type, and reference number."

**Action:** Select a member (e.g. Monicah Wambui), enter KES 500, type "Monthly Contribution", today's date, reference "REF-DEMO-01" → Submit

**Show:** The new record appears at the top of the contributions table.

**Say:** "The record is saved immediately. The member's total contributed balance updates automatically."

---

### Scene 4 — Create Contribution Event (2 min)

**Click:** Events in the sidebar → "Create Event" button

**Say:** "Events are used for special collections — harambees, bereavement support, school fees. Let me create one now."

**Action:** Fill in — Title: "Easter Fundraiser 2026", Type: Harambee, KES 1,000 per member, All Jumuia, due date 2 weeks from today → Save

**Show:** New event card appears at 0% progress.

**Click:** The new event card

**Say:** "The system automatically created a payment record for every active CWA member. Here we can see who has paid and who is still pending."

---

### Scene 5 — Notify Members via WhatsApp (2 min)

**Click:** Notifications in the sidebar

**Say:** "The system is connected to WhatsApp, which is how we reach the members. The green badge here shows we're connected."

**Click:** "Send Notification" button

**Action:** Type message: "Dear sister, please remember to contribute KES 1,000 for the Easter Fundraiser by April 30th. God bless you. — CWA St. Gabriel"

**Select:** Individual Phones → Target Group: "Test Members"

**Click:** Send

**Show:** WhatsApp messages arrive on the test phone within seconds.

**Say:** "The message was sent to the test members instantly. For bulk sends to all members, we just change the target group. The system logs every message sent."

---

### Scene 6 — Debt Management (1.5 min)

**Click:** Debt Management in the sidebar

**Say:** "This page shows every member who has an outstanding balance — members who haven't paid for active contribution events. The system calculates this automatically."

**Show:** The defaulters table with names, Jumuia, and outstanding amounts.

**Click:** "Select All" → "Send Reminder"

**Show:** WhatsApp reminders arrive on the test phone.

**Say:** "One click sends a payment reminder to every defaulter. The admin doesn't have to call anyone individually."

---

### Scene 7 — Reports & PDF Export (1 min)

**Click:** Reports in the sidebar

**Say:** "The reports page gives the treasurer a complete financial overview — monthly collections, expenses, top contributors, and outstanding balances."

**Scroll:** Through the charts slowly.

**Click:** "Export Report" button

**Show:** Browser print dialog opens with a clean, print-ready version of the report (no sidebar, no navbar).

**Say:** "This can be printed directly or saved as a PDF to share with the parish committee."

---

### Scene 8 — Member Login (0.5 min)

**Click:** User menu (top right) → Logout

**Say:** "Now let me show what a member sees when they log in."

**Action:** Click Member tab → type `monicah.wambui@gmail.com` → click Login (no password required for members)

**Show:** Member dashboard — personal balance, own contribution history. Sidebar shows only: My Dashboard, My Profile, Reports.

**Say:** "Monicah can see her own records — what she has contributed, what she owes. She cannot see other members' data or any administrative pages."

---

## Demo Safety Rules

- **NEVER** use "All Members" for individual WhatsApp sends during the demo — other members in the system have placeholder phone numbers that could reach real people.
- Always use "Test Members" (Monicah Wambui + Mary Wanjiru) or the registered CWA group for sends.
- If WhatsApp disconnects, go to Notifications page — the QR code will appear for re-scanning.
