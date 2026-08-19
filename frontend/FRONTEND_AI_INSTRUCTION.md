# LinkSnap Frontend

LinkSnap is a URL-shortening and QR-code management application.

The frontend is built with:

* React
* Vite
* TypeScript
* React Router
* Tailwind CSS
* shadcn/ui
* Sonner
* `qrcode`

The backend is a separate API.

---

# 1. Important Development Rules

Before making changes:

* Inspect the existing project structure.
* Reuse existing components and utilities where possible.
* Do not unnecessarily rewrite existing code.
* Do not invent backend API endpoints.
* If an API endpoint is required but has not been provided, **ask for the endpoint before implementing it**.
* Do not create mock API implementations unless explicitly requested.
* Keep API calls separate from UI components.
* Use TypeScript types for API requests and responses.
* Keep components modular but do not over-engineer.
* Use shadcn/ui components where appropriate.
* Use Tailwind CSS for styling.
* Use Sonner for toast notifications.
* Keep the application responsive.
* Follow the existing project's coding conventions.

The application will receive many additional features later, so avoid tightly coupling the current implementation to future features.

---

# 2. Environment Variables

The frontend must use environment variables for URLs.

```env
VITE_FRONTEND_BASE_URL=
VITE_BACKEND_BASE_URL=
VITE_BACKEND_BASE_URL_API_PREFIX=
```

The backend API uses:

```text
/api/v1
```

The frontend should **not hardcode these URLs**.

Create a centralized API client that uses the environment variables.

For example, conceptually:

```text
VITE_BACKEND_BASE_URL
        +
VITE_BACKEND_BASE_URL_API_PREFIX
        ↓
Backend API base URL
```

---

# 3. Authentication

Authentication is JWT-based.

The only authentication method currently supported by the UI is:

**Google OAuth**

The OAuth UI should initially contain a Google OAuth button.

The actual Google OAuth implementation will be integrated later.

Do not implement a username/password login form.

## OAuth flow

```text
User
 ↓
/oauth
 ↓
Click "Continue with Google"
 ↓
Backend Google OAuth
 ↓
Authentication
 ↓
Frontend /home
```

The backend will redirect the authenticated user to:

```text
/home
```

The OAuth button can initially be a placeholder until the real backend endpoint is provided.

---

# 4. Authentication State

The application must distinguish between:

```text
Authenticated
Unauthenticated
Loading / determining authentication state
```

Do not assume that the user is authenticated simply because they navigated to `/home`.

A centralized authentication mechanism should be used.

If an authenticated-user endpoint is provided later, use it to restore authentication state after page refresh.

---

# 5. Protected Routes

`/home` is a protected route.

If an unauthenticated user attempts to access:

```text
/home
```

redirect them to:

```text
/oauth
```

The OAuth page is the authentication entry point.

The landing page `/` remains publicly accessible.

---

# 6. Routes

Initial routes:

```text
/
│
├── /oauth
│
└── /home
```

### `/`

Public landing page.

### `/oauth`

Google OAuth login page.

### `/home`

Authenticated user's dashboard.

More routes will be added later.

---

# 7. Landing Page

The landing page should be clean, modern, professional, and responsive.

Use the provided Bitly screenshot as **design inspiration only**.

Do not clone the Bitly design.

The application should have its own visual identity.

---

# 8. LinkSnap Branding

The application name is:

**LinkSnap**

For now, use a **text-based logo** rather than an image or SVG.

The word `LinkSnap` should be styled using typography so that it feels like a real SaaS logo.

Requirements:

* Visually distinctive typography
* Good spacing
* Works in both light and dark themes
* Clickable
* Clicking it navigates to `/`

Do not create a complicated logo image.

The branding can later be replaced with an SVG without changing the surrounding layout.

---

# 9. Theme

The application supports:

* Light
* Dark
* System

The default should be:

**System preference**

Use the shadcn-compatible theme approach.

Do not implement a custom theme system unless necessary.

The theme selector belongs in the navbar.

---

# 10. Landing Page Header

Navbar:

```text
┌─────────────────────────────────────────────────────┐
│ LinkSnap                         Login    Theme      │
└─────────────────────────────────────────────────────┘
```

For an unauthenticated user:

* LinkSnap logo
* Login / OAuth navigation
* Theme selector

The authenticated navbar can later be extended with:

* User information
* Logout
* Dashboard navigation

Do not implement unnecessary authenticated-navbar functionality yet.

---

# 11. Hero Section

Use a headline focused on short links, QR codes, and analytics.

Preferred direction:

> **Turn Every Click Into Insight**

Possible alternatives:

> **Short Links. Smarter Insights.**

Below it, show a short description.

Example:

> Create short links, generate QR codes, and understand how people interact with every link you share.

The exact wording can be improved if a better concise tagline fits the design.

---

# 12. Landing Page Generator

Below the hero section, create a prominent card containing two tabs:

```text
[ Short Link ] [ QR Code ]
```

Use shadcn Tabs.

The card should feel like the primary action of the landing page.

---

# 13. Short Link Tab

The public landing page may allow the user to enter a URL, but actual link creation requires authentication.

UI:

```text
Shorten a long link

[ Enter your long URL........................ ]

                    [ Shorten URL ]
```

Validate that the URL is valid before submitting.

At minimum:

* URL must be present.
* URL should use `http://` or `https://`.

If the user is unauthenticated and attempts to create a link:

```text
Redirect → /oauth
```

After successful authentication:

```text
Redirect → /home
```

The actual short-link creation will happen from `/home`.

Do not create a fake short URL on `/`.

---

# 14. QR Code Tab

The landing page may contain the QR-code input UI, but actual QR creation requires authentication.

UI:

```text
Create a QR code

[ Enter your URL........................ ]

                    [ Generate QR Code ]
```

If the user is unauthenticated:

```text
Redirect → /oauth
```

After authentication:

```text
Redirect → /home
```

QR creation will happen from `/home`.

---

# 15. Home Dashboard

`/home` is where the actual link and QR creation functionality lives.

It is accessible only to authenticated users.

Initially, the dashboard should contain:

1. Short-link creation
2. QR-code creation

More dashboard functionality will be added later.

---

# 16. Creating a Short Link

The exact backend endpoint will be provided separately.

Do not invent it.

The general flow is:

```text
User enters long URL
        ↓
Frontend validates URL
        ↓
Frontend calls backend
        ↓
Backend creates short link
        ↓
Frontend receives short-link information
        ↓
Display result
```

The result should eventually provide actions such as:

* Copy
* Open
* Generate QR

Do not implement functionality for endpoints that have not been provided.

---

# 17. QR Code Creation

QR creation consists of **two backend interactions plus frontend QR generation**.

The QR code must contain the **short URL**, not the original long URL.

## Step 1 — Create short link

The frontend sends the user's original URL to the backend.

The backend returns the created link information, including the `linkId` and short URL.

Conceptually:

```text
Original URL
     ↓
Create short link API
     ↓
linkId + shortUrl
```

The exact API response will be provided later.

---

# 18. Step 2 — Generate QR Code

After receiving the short URL:

Use the `qrcode` npm package to generate the QR code on the frontend.

Install it as a project dependency:

```bash
npm install qrcode
```

Do NOT install it globally.

The generated QR code should encode:

```text
shortUrl
```

The QR code should initially use default styling.

---

# 19. Step 3 — Register QR Code

After successfully generating the QR code, call:

```text
POST /links/:linkId/qrcode
```

This tells the backend that a QR code has been created for that link.

The exact backend API request/response details will be provided later.

Do not invent request fields.

---

# 20. QR Code UI

After successful QR creation, display the QR code inside a **dialog/modal**.

Use a shadcn Dialog.

The dialog should contain:

* QR code
* Short URL
* Copy short URL button
* Download QR button
* Close button

If the backend registration fails, do not falsely report the QR code as fully registered.

Handle frontend QR generation and backend registration as separate states.

---

# 21. QR Creation State

The UI should clearly represent:

```text
Idle
 ↓
Creating short link
 ↓
Generating QR code
 ↓
Registering QR code
 ↓
Success
```

Errors should identify the failed operation.

Examples:

```text
Unable to create short link.
```

```text
Unable to register QR code.
```

Do not expose raw server errors.

---

# 22. API Architecture

Do not make API calls directly from components.

Use a centralized API layer.

Recommended structure:

```text
src/
├── api/
│   ├── client.ts
│   ├── auth.api.ts
│   ├── links.api.ts
│   └── qrCode.api.ts
```

Responsibilities:

### `client.ts`

* Backend base URL
* API prefix
* Common headers
* Authentication configuration
* Common response/error handling

### `auth.api.ts`

Authentication-related requests.

### `links.api.ts`

Short-link related requests.

### `qrCode.api.ts`

QR-code related requests.

Only add functions when the corresponding backend endpoint has been provided.

---

# 23. Suggested Project Structure

```text
src/
│
├── api/
│   ├── client.ts
│   ├── auth.api.ts
│   ├── links.api.ts
│   └── qrCode.api.ts
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   ├── landing/
│   │   ├── Hero.tsx
│   │   └── LinkGenerator.tsx
│   │
│   ├── links/
│   │   ├── ShortLinkForm.tsx
│   │   └── ShortLinkResult.tsx
│   │
│   ├── qrcode/
│   │   ├── QrCodeForm.tsx
│   │   ├── QrCodeDialog.tsx
│   │   └── QrCodePreview.tsx
│   │
│   ├── auth/
│   │   └── GoogleLoginButton.tsx
│   │
│   └── ui/
│       └── shadcn components
│
├── pages/
│   ├── LandingPage.tsx
│   ├── OAuthPage.tsx
│   └── HomePage.tsx
│
├── routes/
│   ├── AppRoutes.tsx
│   └── ProtectedRoute.tsx
│
├── hooks/
│   ├── useAuth.ts
│   └── ...
│
├── context/
│   └── AuthContext.tsx
│
├── types/
│   ├── auth.ts
│   ├── link.ts
│   └── qrCode.ts
│
├── lib/
│   └── utils.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

Do not create every file immediately if it is not required. Create files when their responsibility is needed.

---

# 24. Footer

Create a simple generic footer.

Include:

* LinkSnap text logo
* Copyright
* Space for future navigation links

Do not implement unnecessary footer pages yet.

---

# 25. Error Handling

Use user-friendly errors.

Do not display:

```text
PrismaClientKnownRequestError
```

or raw backend stack traces.

Use Sonner for appropriate global notifications.

Use inline validation/errors for form-specific problems.

---

# 26. Responsive Design

The application must work on:

* Mobile
* Tablet
* Desktop

Pay particular attention to:

* Navbar
* Hero typography
* Generator card
* Tabs
* Forms
* QR dialog

The QR dialog must remain usable on small screens.

---

# 27. Future Features

The project will eventually include:

* Link dashboard
* Link management
* Analytics
* Click statistics
* Country analytics
* Browser analytics
* Device analytics
* QR customization
* QR downloads
* Link editing
* Link deletion
* Link expiration
* User profile
* Logout
* Search/filtering
* Analytics charts

Do not implement these until explicitly requested.

The current architecture should make these additions possible without rewriting the existing application.

---

# 28. Working With the Developer

When an API integration is required:

**Ask for the API endpoint before writing the integration.**

For example, ask for:

* HTTP method
* URL
* Request body
* Response body
* Authentication requirements
* Error responses

Do not guess.

The backend API prefix is provided through:

```text
VITE_BACKEND_BASE_URL_API_PREFIX
```

The frontend base URL is:

```text
VITE_FRONTEND_BASE_URL
```

The backend base URL is:

```text
VITE_BACKEND_BASE_URL
```

---

# 29. Current Implementation Scope

Implement only:

* Landing page
* Navbar
* Text-based LinkSnap logo
* Theme selector
* Hero section
* Short Link / QR Code tabs
* URL input UI
* OAuth page
* Protected `/home`
* Basic home dashboard structure
* Responsive layout
* API architecture
* Authentication architecture
* QR-code generation architecture

Do not implement the backend integration until the corresponding API details are provided.

Do not implement analytics, QR customization, advanced dashboard functionality, or other future features yet.
Update the existing **LinkSnap Frontend AI Instruction** by replacing the old “API details will be provided later” sections with the following. The existing document already establishes the API architecture and says not to invent endpoints, so these are the now-approved backend integrations. 

## 30. Backend API Functions — NOW PROVIDED

The backend API functions have now been implemented. **Do not invent alternative endpoints or authentication mechanisms. Use the existing functions from the `src/api/` layer.**

The frontend must use these API functions rather than making `fetch()` calls directly from components.

### Authentication

`src/api/auth.api.ts`

Available functions:

```ts
getCurrentUser()
logout()
googleAuth()
```

Backend endpoints:

```text
GET  /auth/me
POST /auth/logout
/auth/google
```

### Links

`src/api/links.api.ts`

Available functions:

```ts
createLink(longUrl: string)
getLinks()
```

Backend endpoints:

```text
POST /links
GET  /links
```

`GET /links` returns **only links belonging to the authenticated user**.

Do not send `userId` from the frontend.

### QR Codes

`src/api/qrCode.api.ts`

Available functions:

```ts
createQrCode(linkId: string)
getQrCodes()
```

Backend endpoints:

```text
POST /links/:linkId/qrcode
GET  /links/qrcode
```

`GET /links/qrcode` returns the authenticated user's links that have an associated QR code.

---

## 31. Authentication — Important

The backend stores the JWT in an **HttpOnly cookie**.

Therefore:

**DO NOT:**

```ts
localStorage.getItem("token")
```

**DO NOT:**

```ts
Authorization: `Bearer ${token}`
```

The frontend must allow the browser to send the cookie using:

```ts
credentials: "include"
```

The centralized API client is responsible for this.

The frontend should never attempt to read or store the JWT.

---

## 32. Authentication State

Use:

```ts
getCurrentUser()
```

to determine whether the user is authenticated.

Application startup should follow:

```text
Application starts
       ↓
getCurrentUser()
       ↓
 ┌─────┴─────┐
 ↓           ↓
Success     401
 ↓           ↓
Authenticated Unauthenticated
 ↓           ↓
Continue     /oauth
```

There must be a loading state while authentication status is being determined.

Do not immediately redirect `/home` to `/oauth` before `getCurrentUser()` has completed.

---

## 33. Creating a Short Link

Use:

```ts
createLink(longUrl)
```

Do not call the backend directly from the component.

Flow:

```text
User enters URL
      ↓
Frontend validates URL
      ↓
createLink(longUrl)
      ↓
Backend creates link
      ↓
Receive link information
      ↓
Display result
```

Use Sonner for API errors.

Do not expose raw backend errors to the user.

---

## 34. Loading User Links

The home dashboard should use:

```ts
getLinks()
```

to retrieve the authenticated user's links.

Do not provide a `userId`.

```text
GET /links
       ↓
JWT cookie
       ↓
Backend determines user
       ↓
User's links
```

The frontend should treat the backend response as the source of truth.

---

## 35. QR Code Creation

QR creation follows this exact flow:

```text
User enters URL
      ↓
createLink(longUrl)
      ↓
Receive:
    linkId
    shortUrl
      ↓
Generate QR using `qrcode`
      ↓
createQrCode(linkId)
      ↓
Show QR dialog
```

The QR code must encode the **short URL**, never the original long URL.

Use the project dependency:

```bash
npm install qrcode
```

Do **not** install it globally.

---

## 36. QR Code Registration

After generating the QR code locally:

```ts
createQrCode(linkId)
```

must be called.

The frontend should maintain separate states for:

```text
Creating short link
Generating QR
Registering QR
Success
Error
```

If QR generation succeeds but backend registration fails, **do not tell the user that the QR was successfully registered**.

The QR preview may still exist locally, but the UI should clearly indicate that registration failed.

---

## 37. Loading Existing QR Codes

Use:

```ts
getQrCodes()
```

to retrieve existing QR codes.

Backend:

```text
GET /links/qrcode
```

The endpoint returns links belonging to the authenticated user where a QR code exists.

The frontend should not attempt to determine ownership itself.

---

## 38. API Layer

The API structure should now be:

```text
src/
└── api/
    ├── client.ts
    ├── auth.api.ts
    ├── links.api.ts
    └── qrCode.api.ts
```

Functions available:

```text
auth.api.ts
├── getCurrentUser()
├── logout()
└── googleAuth()

links.api.ts
├── createLink()
└── getLinks()

qrCode.api.ts
├── createQrCode()
└── getQrCodes()
```

**Use these functions. Do not create duplicate API functions elsewhere.**

---

## 39. Updated Development Rule

The previous instruction said to ask for API endpoints before implementing integrations. That is no longer necessary for the endpoints listed in Section 30.

The following endpoints are explicitly approved and available:

```text
GET  /auth/me
/auth/google
POST /auth/logout

POST /links
GET  /links

POST /links/:linkId/qrcode
GET  /links/qrcode
```

For any **new endpoint not listed above**, ask the developer for its:

* HTTP method
* URL
* request body
* response
* authentication requirements
* error responses

Do not invent new endpoints.

---

## 40. Important Response Handling

API functions currently return the raw `Response`.

The UI layer is responsible for interpreting the response appropriately.

However, keep response parsing out of presentational components where possible.

For example, prefer:

```text
Component
   ↓
Hook / API integration logic
   ↓
API function
   ↓
Backend
```

rather than putting extensive API handling directly inside JSX.

---

## 41. Current Implementation Scope — Updated

The frontend should now implement:

* Landing page
* Navbar
* LinkSnap text logo
* Theme selector
* Hero section
* Short Link / QR Code tabs
* OAuth page
* Protected `/home`
* Authentication state using `getCurrentUser()`
* Short-link creation using `createLink()`
* User links using `getLinks()`
* QR generation using `qrcode`
* QR registration using `createQrCode()`
* Existing QR codes using `getQrCodes()`
* QR dialog
* Logout using `logout()`
* Responsive layout
* Centralized API architecture
* Sonner notifications

Do **not** implement yet:

* Analytics dashboard
* QR customization
* Link editing
* Link deletion
* Link expiration
* Advanced analytics
* Search/filtering
* User profile
* Other endpoints not listed above.

The original document already defines future analytics, QR customization, link management, and related functionality as future scope, so keep those untouched. 

### One correction to the old instruction

The old document says:

> “The exact backend endpoint will be provided separately.”

for short-link creation and QR registration. 

That should now be considered **outdated**. The API functions listed above are the authoritative interface the frontend AI should use.
