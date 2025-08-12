# Slack Connect Application

This project is a full-stack application designed to connect a user's Slack workspace, send messages instantly, and schedule messages for future delivery.  
It implements secure token management using Slack's OAuth 2.0 flow and supports encrypted storage of access tokens in MongoDB.

## Features
- Secure Slack OAuth 2.0 authentication
- Access and refresh token management
- Send messages instantly from the connected Slack workspace
- Schedule messages to be sent at a future date/time
- Encrypted token storage in MongoDB
- Backend API for message handling and scheduling

## Technology Stack

### Backend
- **Node.js** – runtime environment
- **Express.js** – API framework
- **Mongoose** – MongoDB object modeling
- **Axios** – HTTP client for Slack API requests
- **node-cron** – scheduling library
- **dotenv** – environment variable management
- **cors** – handling cross-origin requests
- **nodemon** – development auto-restart tool

### Database
- **MongoDB Atlas** – cloud-hosted database for storing user tokens, installations, and scheduled messages

### Frontend
- (Not included in this codebase – integrate with your frontend of choice, such as React.js)

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Install backend dependencies
```bash
cd "slack dev"
npm install
```

### 3. Configure environment variables
Create a `.env` file inside the `slack dev` directory with the following:
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/slackconnect
BASE_URL=https://<YOUR_NGROK>.ngrok.io
FRONTEND_URL=http://localhost:5173
SLACK_CLIENT_ID=<your-slack-client-id>
SLACK_CLIENT_SECRET=<your-slack-client-secret>
TOKEN_ENCRYPTION_KEY=<secure-32-char-key>
```

### 4. Run the backend
```bash
npm start
```
For development with auto-reload:
```bash
npx nodemon server.js
```

### 5. Slack App Setup
1. Go to [Slack API Apps](https://api.slack.com/apps) and create a new app.
2. Under **OAuth & Permissions**, add the Redirect URL:
   ```
   https://<YOUR_NGROK>.ngrok.io/auth/slack/callback
   ```
3. Add Bot Token Scopes:
   - `chat:write`
   - `channels:read`
   - `groups:read`
   - `im:read`
   - `im:write`
4. Install the app into your Slack workspace.

## Architectural Overview
The system follows a **backend–Slack API** architecture:

1. **Backend (Express.js)**  
   - Handles Slack OAuth 2.0 login and callback  
   - Encrypts and stores access/refresh tokens in MongoDB  
   - Exposes endpoints for sending messages and scheduling them  

2. **Database (MongoDB)**  
   - Stores user installations, encrypted tokens, and scheduled message metadata  

3. **Scheduling (node-cron)**  
   - Runs background jobs to deliver scheduled messages  
   - Ensures execution reliability even after server restarts  

## Challenges and Learnings

### Challenges
- Implementing a secure OAuth flow with Slack and correctly handling the authorization callback.
- Managing token expiration and implementing auto-refresh to prevent disruptions.
- Ensuring scheduled tasks remain reliable across backend restarts.
- Encrypting sensitive data while keeping it retrievable for API calls.

### Learnings
- Practical implementation of Slack OAuth 2.0 and API scopes.
- Secure token storage and encryption practices.
- Scheduling background tasks with node-cron.
- MongoDB schema design for storing tokens and message metadata.

## License
This project is licensed under the MIT License.
