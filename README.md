# Project Setup Instructions

## Installation

1. **Install dependencies**
   ```sh
   npm i
   ```
2. **Navigate to the backend folder and install dependencies**
   ```sh
   cd backend
   npm i
   ```

## Running the Servers

### 1. Database Server (MongoDB)
- Ensure MongoDB is running locally or use a cloud-based MongoDB instance.
- Configure `.env` with the appropriate MongoDB connection string.

### 2. LLM Server
- Start the LLM server inside the `backend` directory.
- Ensure necessary API keys are set in the `.env` file.

### 3. Frontend Server
- Navigate back to the root directory:
   ```sh
   cd ..
   ```
- Start the frontend server:
   ```sh
   npm run dev
   ```

## Configuration
- Update the `.env` file with the correct API keys, database connection strings, and other required configurations.

## Notes
- Ensure all servers are running before testing the full application.
- If any dependency issues arise, try reinstalling with `npm ci` instead of `npm i`.

