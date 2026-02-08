# Telechat Backend (Node.js + Express + TypeScript)

Implements the provided JSON backend spec using Express, MongoDB (Mongoose), JWT auth, and Socket.IO.

## Features

- JWT authentication
- MongoDB models: User, Conversation, Message
- REST endpoints for login, conversations, messages
- Socket.IO real-time messaging (`send_message`, `new_message`, `message_received`)
- Zod input validation

## Setup

1. Copy env file:
   - `.env.example` → `.env`
2. Update values:
   - `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`

## Install

```
npm install
```

## Run (dev)

```
npm run dev
```

## API

### POST /auth/login

Request:

```json
{ "username": "string", "password": "string" }
```

Response:

```json
{ "user": { "_id": "string", "username": "string" }, "token": "string" }
```

### GET /conversations (JWT required)

Returns conversations with populated `participants`.

### GET /conversations/:id/messages (JWT required)

Returns all messages in the conversation (oldest → newest).

### POST /messages (JWT required)

Request:

```json
{ "conversationId": "string", "content": "string" }
```

Response: `Message`

## Socket.IO

- Client must connect with JWT:
  ```js
  const socket = io("http://localhost:4000", { auth: { token } });
  ```
- Events:
  - `send_message` (client → server) payload: `Message`
  - `new_message` (server → other participant) payload: `Message`
  - `message_received` (server → sender) payload: `Message`

## Notes

- This backend expects users to exist in MongoDB (no signup endpoint in spec).
- Passwords are hashed with bcrypt on save.
