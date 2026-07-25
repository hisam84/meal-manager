# MESS MEAL TRACKER — COMPLETE DEVELOPMENT SPECIFICATION

Build a complete, modern, responsive **Mess Meal Tracker Web App**.

The app is currently a **frontend-only prototype**. No backend is required.

---

## 1. TECHNOLOGY

Use only:

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- LocalStorage

The project must contain exactly:

```text
index.html
style.css
app.js

Do not use React, Vue, Node.js, PHP, Firebase, Supabase, or any database.

The architecture should be organized so a backend can be added later.

2. AUTHENTICATION

Create a login and registration system using phone number instead of email.

Registration

Fields:

Full Name
Phone Number
Password
Confirm Password

Validate:

Required fields
Valid Bangladesh phone number
Unique phone number
Password confirmation
Login

Fields:

Phone Number
Password

Features:

Login
Logout
Session persistence after refresh
Inactive user cannot login

Use LocalStorage for authentication.

Important: Clearly comment in code that LocalStorage authentication is only for prototype/demo purposes and is not production secure.

3. USER ROLES

Two roles:

Admin
Member

The first registered user automatically becomes Admin.

All later registered users become Members.

Admin can:
Manage all members
Add/Edit/Delete meals
Add/Edit/Delete expenses
Add/Edit/Delete payments
View all reports
View all monthly summaries
Manage settings
Backup/Restore data
Reset application data
Member can:
View personal dashboard
Add own meals
Edit/delete own meal records
View own meal history
View own payments
View monthly summary
View expenses
Edit own profile
Change password

Members must not be able to manage other members or modify expenses.

4. DASHBOARD

Create a modern dashboard.

Admin Dashboard

Show:

Total Members
Total Meals
Total Expenses
Current Meal Rate
Total Payments
Total Payable
Total Receivable

Also show:

Recent Activities
Meal Statistics
Expense Statistics
Member Balance Summary
Member Dashboard

Show:

My Total Meals
My Meal Bill
My Paid Amount
My Balance
Current Meal Rate

Quick actions:

Add Meal
View Meals
View Payments
View Monthly Summary
5. MEAL MANAGEMENT

Each meal record:

{
  id,
  userId,
  date,
  breakfast,
  lunch,
  dinner,
  total,
  note,
  createdAt,
  updatedAt
}

Meal values:

0
0.5
1

Meal total must be automatically calculated:

Breakfast + Lunch + Dinner

Features:

Add Meal
Edit Meal
Delete Meal
Meal History
Month Filter
Date Filter
Member Filter
Search by Member Name/Phone

Admin can manage all members' meals.

Member can manage only their own meals.

Quick meal buttons:

Breakfast
Lunch
Dinner
Full Day
Clear
6. EXPENSE MANAGEMENT

Admin-only.

Expense fields:

Date
Amount
Description
Category

Categories:

Grocery
Rice
Fish
Meat
Vegetable
Gas
Electricity
Cook
Rent
Water
Internet
Other

Features:

Add Expense
Edit Expense
Delete Expense
Search
Category Filter
Month Filter
Date Filter

Members can only view expenses.

7. PAYMENT MANAGEMENT

Payment fields:

Member
Amount
Date
Note

Features:

Add Payment
Edit Payment
Delete Payment
Payment History
Member Filter
Month Filter

Only Admin can manage payments.

Members can view only their own payments.

8. MONTHLY CALCULATION

All calculations must be month-specific.

Use:

YYYY-MM

Example:

2026-07
Meal Rate
Total Expense / Total Meals

If Total Meals = 0, Meal Rate = 0.

Member Bill
Member Meals × Meal Rate
Balance
Total Paid - Member Bill

Status:

Positive Balance → Receivable
Negative Balance → Payable
Zero Balance → Settled

Use Bangladeshi currency:

৳

Use two decimal places where required.

9. MONTHLY SUMMARY

Create a Monthly Summary page.

Month selector.

Show:

Total Members
Total Meals
Total Expenses
Meal Rate
Total Payments
Total Payable
Total Receivable

Member summary table:

Member
Breakfast
Lunch
Dinner
Total Meals
Meal Cost
Paid
Balance
Status

Also show settlement summary.

10. MEMBER MANAGEMENT

Admin-only.

Member list:

Name
Phone
Role
Status
Joined Date
Meals
Bill
Paid
Balance

Features:

Add Member
Edit Member
Change Role
Reset Password
Activate/Deactivate
Delete Member

Prefer deactivation instead of deletion so historical data remains safe.

Inactive users cannot login.

Never allow deletion of the last Admin.

11. PROFILE

User profile should show:

Name
Phone
Role
Joined Date
Account Status

User can update:

Name
Phone
Password

Password change requires:

Current Password
New Password
Confirm Password
12. SEARCH & FILTER

Implement search and filters wherever useful.

Search:

Member Name
Phone
Meal Member
Expense Description
Expense Category

Filters:

Month
Date
Member
Category
13. UI/UX

Create a professional modern dashboard.

Layout:

Sidebar
Topbar
Main Content

Desktop:

Sidebar navigation
Dashboard cards
Responsive tables
Charts/statistics

Mobile:

Collapsible sidebar or mobile menu
Responsive cards
Horizontally scrollable tables
Touch-friendly buttons
Easy Add Meal action

Support screen sizes:

1920px
1440px
1024px
768px
480px
375px

No horizontal page overflow.

14. DARK MODE

Implement:

Light Mode
Dark Mode

Save theme preference in LocalStorage.

Theme must remain after page refresh.

Use CSS variables for theme colors.

15. UI COMPONENTS

Create reusable:

Modal
Toast Notification
Confirmation Dialog
Empty State
Loading State
Form Validation

Do not use browser alert() for normal notifications.

Use toast messages such as:

Member added successfully.
Meal saved successfully.
Payment recorded successfully.
Invalid phone number.
Incorrect password.
Permission denied.
16. LOCALSTORAGE

Use these keys:

mess_users
mess_meals
mess_expenses
mess_payments
mess_settings
mess_current_user
mess_app_initialized

Create a centralized Storage abstraction.

Example:

const Storage = {
  getUsers(),
  saveUsers(),
  getMeals(),
  saveMeals(),
  getExpenses(),
  saveExpenses(),
  getPayments(),
  savePayments(),
  getSettings(),
  saveSettings(),
  getCurrentUser(),
  setCurrentUser(),
  clearCurrentUser()
};

Do not directly access LocalStorage throughout the application.

17. BACKUP & RESTORE

Admin-only.

Backup

Export all application data as JSON:

mess-backup-YYYY-MM-DD.json

Include:

Users
Meals
Expenses
Payments
Settings
Restore

Allow Admin to upload JSON backup.

Validate data before importing.

If invalid:

Reject import
Keep existing data safe
18. RESET DATA

Admin-only.

Provide:

Reset Everything

Require two-step confirmation.

After reset:

Clear LocalStorage
Clear session
Return to welcome/setup screen
19. FIRST-TIME SETUP

On first launch show:

Welcome to Mess Meal Tracker

[Start Fresh]
[Load Demo Data]

Demo Data should include:

1 Admin
3-5 Members
Sample Meals
Sample Expenses
Sample Payments

Demo Admin:

Phone: 01700000000
Password: admin123

Clearly mark this as demo data.

20. DATA MODELS
User
{
  id,
  name,
  phone,
  password,
  role,
  active,
  createdAt
}
Meal
{
  id,
  userId,
  date,
  breakfast,
  lunch,
  dinner,
  total,
  note,
  createdAt,
  updatedAt
}
Expense
{
  id,
  amount,
  description,
  category,
  date,
  addedBy,
  createdAt
}
Payment
{
  id,
  userId,
  amount,
  date,
  note,
  addedBy,
  createdAt
}
21. CODE ORGANIZATION

Organize app.js into logical sections:

Constants
App State
Storage
Utilities
Authentication
Authorization
Calculations
Dashboard
Meals
Expenses
Payments
Members
Reports
Settings
Backup/Restore
Theme
Modal
Toast
Event Listeners
Initialization

Create reusable functions:

calculateTotalMeals(month)
calculateTotalExpenses(month)
calculateMealRate(month)
calculateMemberMeals(userId, month)
calculateMemberBill(userId, month)
calculateMemberPaid(userId, month)
calculateMemberBalance(userId, month)

Use unique IDs instead of array indexes.

Use ISO date format:

YYYY-MM-DD
22. ERROR HANDLING

Handle safely:

Invalid LocalStorage data
Duplicate phone number
Invalid phone
Wrong password
Inactive user
Invalid backup file
Missing user references
Zero meals
Invalid amount
Negative amount
Empty data

The app must never crash due to invalid data.

Do not show:

NaN
Infinity
undefined
23. TESTING

Before finalizing, test:

Authentication
Registration
Admin creation
Member creation
Login
Wrong password
Logout
Session persistence
Members
Add
Edit
Deactivate
Reactivate
Reset Password
Delete
Last Admin protection
Meals
Add
Edit
Delete
Half Meal
Full Meal
Month Filter
Member Filter
Expenses
Add
Edit
Delete
Category Filter
Month Filter
Payments
Add
Edit
Delete
Member Filter
Month Filter
Calculations

Example:

Total Expense = ৳30,000
Total Meals = 600
Meal Rate = ৳50

Member:

Meals = 50
Bill = ৳2,500
Paid = ৳3,000
Balance = +৳500
Status = Receivable

Verify all calculations.

Backup
Export
Clear
Import
Verify restored data
Responsive

Test:

Desktop
Tablet
Mobile
Final

Open browser console and fix all JavaScript errors.

24. FINAL FILE STRUCTURE

The final project must contain:

Mess Meal Tracker/
│
├── index.html
├── style.css
└── app.js
25. FINAL DEVELOPMENT INSTRUCTION

Build the application in this order:

Create HTML structure.
Create modern responsive CSS.
Create LocalStorage abstraction.
Create data models.
Create authentication.
Create role-based access.
Create dashboard.
Create meal management.
Create expense management.
Create payment management.
Create member management.
Create monthly calculations.
Create reports and summaries.
Create search and filters.
Create modal and toast systems.
Add dark mode.
Add backup/restore.
Add reset system.
Add demo data.
Test all features.
Fix all bugs and console errors.
Perform final code review.

Do not stop after creating only the UI.

All core features must be functional.

The final result must be a polished, responsive, fully functional frontend-only Mess Meal Tracker that uses LocalStorage and can later be connected to a real backend.