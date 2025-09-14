# PC Store — Fullstack (Frontend + Backend)

Simple README with setup and common troubleshooting notes.

## Overview

This repository contains a React + Vite frontend and a Node/Express + MongoDB backend for a PC store. Features include product catalog, cart/checkout, custom build flow, and admin order management.

## Repo layout

- `/frontend` — React + Vite app
- `/backend` — Express API, Mongoose models
- `/backend/models` — MongoDB models (Order, Cart, Checkout, Product, User, ...)
- `/backend/routes` — API routes
- `/frontend/src` — React source (components, pages, redux slices)

## Requirements

- Node.js (recommended 18+)
- npm
- MongoDB (local or cloud)

## Environment

Create `.env` files in both `backend` and `frontend` as needed. Example variables:

Backend (`/backend/.env`)

- MONGO_URI=mongodb://localhost:27017/pcstore
- JWT_SECRET=your_jwt_secret
- PORT=9000
- DEFAULT_PRODUCT_IMAGE=https://placehold.co/400x300?text=No+Image

Frontend (`/frontend/.env`)

- VITE_BACKEND_URL=http://localhost:9000

## Install & Run (macOS)

1. Backend

   - cd backend
   - npm install
   - npm run dev # or `npm start` if `dev` script is not defined

2. Frontend
   - cd frontend
   - npm install
   - npm run dev

Open frontend at the Vite URL (usually http://localhost:5173) and backend at the configured PORT (default 9000).

## Seeding sample data

If there is a seeder script:

- cd backend
- node seeder.js

## Common issues & notes

- Mongoose ObjectId cast errors:

  - Custom build/cart items must not set `product` or `productId` to arbitrary strings (e.g. `"custom_build_..."`). Backend expects 24-hex ObjectId. Either omit those fields for custom items or store a valid ObjectId.
  - Ensure items include required fields (e.g. `image`) — backend uses a fallback image but some schemas require `image` to be present.

- Cart not clearing after order:

  - Frontend must clear Redux cart and localStorage `"cart"` after successful order creation. Check `frontend/src/redux/slices/checkoutSlice.js` for `clearCart()` dispatch and `localStorage.removeItem('cart')`.

- Admin orders list not updating after status change:
  - Admin detail page updates only its local state; the admin orders list is populated from Redux. Either refetch all orders or dispatch an action to update the single order in the Redux slice after status change.

## Where to look in code

- Frontend:

  - Admin order UI: `frontend/src/components/Admin/AdminOrderDetails.jsx`
  - Checkout / create order: `frontend/src/redux/slices/checkoutSlice.js`
  - Cart slice: `frontend/src/redux/slices/cartSlice.js`
  - Build page: `frontend/src/pages/Build.jsx`

- Backend:
  - Order endpoints: `backend/routes/orderRoutes.js`
  - Checkout endpoints: `backend/routes/checkoutRoutes.js`
  - Cart model: `backend/models/Cart.js`
  - Mongoose models: `backend/models/*.js`

## Debugging tips

- Use browser Network and Redux devtools to confirm actions and state updates.
- Inspect backend logs (nodemon output) for Mongoose validation errors.
- For quick manual reset: clear frontend cart in browser console:
  - localStorage.removeItem('cart')
  - optionally dispatch cart slice `clearCart()` in devtools

## Contributing

Make focused changes, run both frontend and backend locally, and verify flows:

- Add build → cart → checkout → order
- Admin status update reflects in orders list

License: MIT
