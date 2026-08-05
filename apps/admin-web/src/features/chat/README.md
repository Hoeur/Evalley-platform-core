# Chat core module

Reusable real-time chat plumbing over the NestJS **Chat API**, cloned from the
standalone chat client and adapted to the admin dashboard. It powers the
customer-support inbox (`features/support`), modelling each customer
conversation as a direct-message thread between the customer and the signed-in
agent.

## Pieces

- `chat.types.ts` / `socket.types.ts` — domain + typed socket events.
- `lib/chat-socket.ts` — single socket.io-client instance (token injected on connect).
- `lib/message-cache.ts` — TanStack Query cache helpers for live message updates.
- `lib/asset-url.ts` — resolve Chat API upload URLs.
- `lib/chat-config.ts` — browser Chat API/socket URLs from `NEXT_PUBLIC_CHAT_*`.
- `store/chat-store.ts` — Zustand: typing, presence, unread, active thread.
- `api/chat-token.server.ts` + `app/api/chat/token/route.ts` — the token bridge.
- `api/dm.client.ts` / `api/uploads.client.ts` — Chat API REST (Bearer token).
- `hooks/` — `use-chat-token`, `use-chat-socket` (event wiring), `use-conversations`,
  `use-dm-thread` (history + send/react/delete/attachment).

## Required setup

1. Install the new runtime dep: `pnpm install` (adds `socket.io-client`).
2. Set env per client (each `CLIENT_KEY` uses its own env, so each dashboard
   replies from its own Chat API support account):

   ```
   # server (token bridge)
   CHAT_API_BASE_URL=http://localhost:3001/api

   # Option C (recommended): log in as a shared support account, auto-register if missing
   CHAT_API_AGENT_EMAIL=support@yourbrand.com
   CHAT_API_AGENT_PASSWORD=<password>
   CHAT_API_AGENT_USERNAME=            # optional; defaults to the email prefix
   CHAT_API_AUTO_REGISTER=true

   # Option A (advanced): service-token endpoint on the Chat API
   #CHAT_API_SERVICE_KEY=<shared service key>
   # Option B (advanced): sign locally with the Chat API JWT secret + a known user id
   #CHAT_API_SHARED_JWT_SECRET=<same as Chat API JWT_ACCESS_SECRET>
   #CHAT_API_AGENT_USER_ID=<a Chat API user id>

   # browser
   NEXT_PUBLIC_CHAT_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_CHAT_SOCKET_URL=http://localhost:3001
   ```

   With Option C the token bridge logs the agent account into the Chat API and
   reuses the backend-issued access token + user id — no id to look up and no
   backend change.

## Token bridge — Chat API endpoint (Option A)

Add to the NestJS Chat API a server-to-server endpoint the admin server calls:

```
POST /api/auth/service-token
Headers: x-service-key: <CHAT_API_SERVICE_KEY>
Body:    { externalId, email, username }
200:     { accessToken, chatUserId, expiresAt }
```

It should provision/look up the agent's chat user and return a short-lived
access token (same shape the socket handshake expects). Until it exists, use
the Option B dev fallback above (single shared agent account).

## Parity note

The DM model covers text, presence, typing, read receipts, reactions, replies,
delete, attachments (image/file/voice) and link previews. Message **editing**
is not supported by the Chat API's `DirectMessage` model (only room messages),
so it is intentionally omitted until a backend field + `PATCH /dm/:id` land.
