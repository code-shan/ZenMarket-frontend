# ZenMarket Frontend

ZenMarket is a customer-facing e-commerce frontend built using Next.js. It integrates with a Laravel backend API to provide a complete marketplace experience including product browsing, cart management, checkout, authentication, profile management, and order tracking.

---

## 🚀 Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript (React)
* **Styling:** Tailwind CSS + shadcn/ui
* **State Management:** Local state + URL query params
* **API Integration:** REST API (Laravel backend)
* **Authentication:** Token-based (HTTP-only Cookie)
* **Architecture:** Component → Service → API

---

## ⚙️ Prerequisites

- Node.js ≥ 20 (Recommended: Node 22+)
- npm

> Recommended (used in development): Node v22.17.1

---

## 🔗 Backend Repository (Required)

This frontend requires a backend API to function.

👉 Backend (Laravel) repository:
```bash
git clone https://github.com/code-shan/ZenMarket-backend.git
```
Make sure the backend is running before starting this frontend.

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/code-shan/ZenMarket-frontend.git
cd ZenMarket-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.example .env
```

### 4. Configure environment

Update `.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

> ⚠️ Make sure the Laravel backend is running before starting the frontend.

### 5. Run the application

```bash
npm run dev
```

Access:

http://localhost:3000

### 6. Build for production

```bash
npm run build
npm start
```

---

## 🧠 Architecture Overview

The project follows a clean frontend architecture:

Component → Service → API

### Principles:

* Components handle UI rendering only
* Services handle API communication
* Types ensure strong typing across the app
* Helpers manage shared logic (auth, API config)
* Focus on maintainability and scalability

---

## ⚙️ Core Features

* Product listing with search, filters, sorting, and pagination
* Featured products and categories on homepage
* Cart management (add, remove, clear)
* Checkout process (Cash on Delivery)
* User authentication (login, register, OTP verification)
* Profile management
* Order history and tracking
* Order status visualization (pending → delivered)
* Responsive UI for mobile and desktop
* Proper handling of loading, empty, and error states

---

## ⚖️ Design Decisions & Trade-offs

### Next.js (App Router)

**Reason:**

* Built-in routing, SSR, and performance optimizations
* Supports modern React patterns (Server/Client Components)
* Provides a scalable and structured architecture

**Trade-off:**

* Introduces a learning curve due to concepts like server components, file-based routing, and data fetching strategies compared to traditional SPA frameworks

---

### Tailwind CSS + shadcn/ui

**Reason:**

* Rapid UI development
* Consistent design system
* Accessible components

**Trade-off:**

* Tailwind can become class-heavy if not structured properly
* shadcn requires manual composition

---

### Service-based API Layer

**Reason:**

* Keeps UI clean
* Centralized API logic
* Easier to maintain

**Trade-off:**

* Slightly more boilerplate

---

### HTTP-only Cookie Authentication

**Reason:**

* Improved security by preventing JavaScript access to tokens (mitigates XSS risks)
* Aligns with production-grade authentication best practices
* Allows secure session management handled by the backend

**Trade-off:**

* Slightly more complex setup compared to localStorage (requires proper backend configuration, cookies, and CSRF handling)
* Requires careful handling of CORS and credentials in frontend requests

---

## 📈 Future Improvements

* Implement refresh token mechanism
* Introduce global state management (Zustand / Redux)
* Integrate real payment gateways (Stripe / PayHere)
* Real-time order updates (WebSockets)
* API caching (React Query / SWR)
* UI animations and dark mode support
* Dockerized deployment