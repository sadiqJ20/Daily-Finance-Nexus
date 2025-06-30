# Daily Finance Nexus - Deployment Guide

This guide will help you deploy the Daily Finance Nexus application and ensure that MongoDB Atlas is properly connected for data storage and retrieval.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Verifying MongoDB Atlas Connection](#verifying-mongodb-atlas-connection)
5. [Adding and Retrieving Data](#adding-and-retrieving-data)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- MongoDB Atlas account
- Git (optional, for version control)

## Backend Deployment

### 1. Navigate to the server directory

```bash
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

The `.env` file in the server directory already contains the MongoDB connection string and JWT secret. Make sure these values are correct:

```
# MongoDB connection string
MONGODBURI=mongodb+srv://sadiqj8227:myfwwcn4ZaNZJH9F@cluster0.il2a36j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT secret key used for signing tokens
JWT_SECRET=freckingkjhgfcg90876543245678
```

### 4. Start the server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server should start on port 4000 (or the port specified in your environment variables).

## Frontend Deployment

### 1. Navigate to the frontend directory

```bash
cd daily-finance-nexus-main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the application

```bash
npm run build
```

This will create a `dist` directory with the built application.

### 4. Start the application

For development:
```bash
npm run dev
```

To preview the production build:
```bash
npm run preview
```

## Verifying MongoDB Atlas Connection

To verify that your application is correctly connected to MongoDB Atlas:

### 1. Run the MongoDB connection test script

```bash
cd server
node test-mongodb-connection.js
```

You should see output similar to:

```
Successfully connected to MongoDB Atlas

Available collections:
 - payments
 - loans
 - users

Document counts:
 - payments: 0 documents
 - loans: 0 documents
 - users: 0 documents

Connection closed
```

This confirms that:
- Your application can connect to MongoDB Atlas
- The database and collections are created
- Currently, there are no documents in the collections

## Adding and Retrieving Data

To add data to your MongoDB Atlas database, you can use the API endpoints provided by the backend server.

### 1. Seed the database with initial data (optional)

```bash
cd server
npm run seed
```

This will add sample users, loans, and payments to your database.

### 2. Using the API endpoints

#### Register a user

```
POST http://localhost:4000/api/auth/register

Body:
{
  "role": "finance",
  "name": "Finance User",
  "financeName": "Finance Company",
  "uniqueId": "FIN1001",
  "password": "password123"
}
```

#### Create a loan

```
POST http://localhost:4000/api/loans

Body:
{
  "loanId": "SHKP1234",
  "shopkeeperName": "Shop Owner",
  "shopkeeperPhone": "9876543210",
  "amount": 10000,
  "startDate": "2023-05-01",
  "duration": 30,
  "dailyEmi": 350
}
```

#### Record a payment

```
POST http://localhost:4000/api/payments

Body:
{
  "loanId": "[loan_id_from_database]",
  "date": "2023-05-02",
  "status": "paid"
}
```

### 3. Verify data storage

After adding data through the API, run the verification script again to confirm data is being stored:

```bash
node test-mongodb-connection.js
```

You should now see document counts greater than 0 for the collections you've added data to.

## Troubleshooting

If you're having issues with data storage:

1. **Check API Responses**: Ensure your API calls return success status codes (200, 201)
2. **Verify MongoDB Connection String**: Your connection string in .env is correct
3. **Check Network Access**: Ensure your IP address is whitelisted in MongoDB Atlas
4. **Check Database User**: Verify the username and password in your connection string

### Common Issues

#### Cannot connect to MongoDB Atlas

- Ensure your IP address is whitelisted in MongoDB Atlas Network Access settings
- Verify that the username and password in your connection string are correct
- Check if your MongoDB Atlas cluster is running

#### API calls not storing data

- Check the server logs for any errors
- Ensure your request body matches the expected schema
- Verify that you're sending the correct content type (application/json)

#### Frontend not displaying data

- Check browser console for any errors
- Verify that the frontend is making requests to the correct backend URL
- Ensure that CORS is properly configured on the backend

## Conclusion

Your application is now deployed and connected to MongoDB Atlas. You can add and retrieve data using the API endpoints provided by the backend server. If you encounter any issues, refer to the troubleshooting section or check the server logs for more information.