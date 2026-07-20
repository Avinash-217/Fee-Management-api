# Fee Management System - Backend

This is the Node.js/Express/Mongoose backend service for the Fee Management System. It manages student fee details, payments, and balances.

## Project Structure

```text
fee management/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB Connection
│   ├── controllers/
│   │   └── fee.controller.js  # CRUD and Payment logic
│   ├── middleware/
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   └── fee.model.js       # MongoDB Mongoose schema
│   ├── routes/
│   │   └── fee.routes.js      # Endpoint routes definitions
│   ├── .env                   # Configuration variables
│   ├── package.json           # Project dependencies
│   └── server.js              # Application entry point
└── README.md                  # This documentation
```

---

## Prerequisites

* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) running locally or an Atlas connection string

---

## Setup & Running

1. **Configure Environment Variables**:
   In `backend/.env`, verify the port and MongoDB connection URI:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/fee_management
   NODE_ENV=development
   ```

2. **Install Dependencies**:
   Navigate into the `backend` folder and install:
   ```bash
   cd backend
   npm install
   ```

3. **Start Development Server**:
   Start the application with hot-reloading (using `nodemon`):
   ```bash
   npm run dev
   ```
   Or start normally:
   ```bash
   npm start
   ```

---

## API Endpoints

All routes are prefixed with `/api/fees`.

| Method | Endpoint | Description | Request Body Requirements |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/fees` | Create new fee record | `studentId`, `studentName`, `rollNumber`, `department`, `academicYear`, `totalAmount` |
| **GET** | `/api/fees` | Get all fee records | Optional query filters: `rollNumber`, `paymentStatus`, `department` |
| **GET** | `/api/fees/:id` | Get single fee record | *None* |
| **PUT** | `/api/fees/:id` | Update fee record | `studentId`, `studentName`, `rollNumber`, `department`, `academicYear`, `totalAmount` (fields are optional) |
| **POST** | `/api/fees/:id/payments` | Record student payment | `amount` (Number), `paymentMode` (Cash, Card, UPI, Net Banking, Cheque), `referenceId` (String) |
| **DELETE** | `/api/fees/:id` | Delete fee record | *None* |

### Payment Automation
The system automatically tracks payments. When you make a request to `POST /api/fees/:id/payments`, the amount is added to `paymentHistory`, `amountPaid` is updated, the remaining `balanceAmount` is calculated, and the `paymentStatus` is updated dynamically:
* `Pending` if no payments are made.
* `Partially Paid` if payments are recorded but `balanceAmount > 0`.
* `Paid` if the total payments equal `totalAmount`.
