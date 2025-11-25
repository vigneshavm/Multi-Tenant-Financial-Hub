# Textile Business Manager – Multi-Tenant Financial Hub

A multi-tenant financial management application built using **React** and **Firebase Firestore**, designed for small textile businesses.

---

## Features

- **Role-Based Access**
  - Owner
  - Staff
- **Multi-Tenant Data Isolation**
- **Real-Time Tracking**
  - Sales
  - Expenses
  - Profit
- **Date & Status Filtering**
- **Bank & Cheque Management** *(Owner only)*
- **Vendor Purchase Tracking**
  - Paid
  - Pending
  - Overdue

---

## Project Structure

```

/src
|-- components/
|   |-- Common/        (SummaryCard, ChartRenderer, Lists)
|   |-- Layout/        (Header, DateFilter)
|   |-- Pages/         (SalesAndExpenses, PurchaseHistory, etc.)
|
|-- hooks/
|   |-- useAuth.js
|   |-- useCalculations.js
|   |-- useData.js
|   |-- useHandlers.js
|
|-- utils/
|   |-- dataUtils.js     (date helpers, filters, grouping logic)
|   |-- firebase.js      (Firebase initialization)
|
|-- App.jsx              (Main component, router, state container)
|-- main.jsx             (Application entry point)

````

---

## Setup (Local Development)

### 1. Install Dependencies  
```bash
npm install
````

### 2. Environment Variables

Set up your Firebase configuration. Typical values include:

* `firebaseConfig`
* `initialAuthToken`
* `appId`

These are usually stored in a `.env` file.

### 3. Run the Application

Start the development server:

```bash
npm run dev
```


/src
│
├── components/
│   ├── Common/              # SummaryCard, ChartRenderer, Lists
│   ├── Layout/              # Header, DateFilter
│   └── Pages/               # SalesAndExpenses, PurchaseHistory, etc.
│
├── hooks/
│   ├── useAuth.js
│   ├── useCalculations.js
│   ├── useData.js
│   └── useHandlers.js
│
├── utils/
│   ├── dataUtils.js         # Date helpers, filters, grouping logic
│   └── firebase.js          # Firebase initialization
│
├── App.jsx                  # Main component, router, global state handling
└── main.jsx                 # Application entry point

