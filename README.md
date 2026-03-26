# Solanki Agencies — Static Site Prototype

This workspace contains a simple static multi-page site prototype for Solanki Agencies: a B2B hotelware distributor.

Pages:
- `index.html` — Home
- `about.html` — About Us
- `products.html` — Products (live catalog)
- `booking.html` — Booking & Payment (simple checkout prototype)
- `why.html` — Why Choose Us


How to run locally (recommended - includes API endpoint):

1) Install dependencies:

```powershell
npm install
```

2) Start the server (development):

```powershell
npm run dev
```

or in production mode:

```powershell
npm start
```

Then open http://localhost:5500 in your browser.

Notes:
- The server provides `GET /api/products` (reads `products.json`) and `POST /api/bookings` (persists to `bookings.json`).
- Frontend will attempt to fetch products from `/api/products` and falls back to embedded sample data when the API is not available (useful if opening files without the server).

Next steps / suggestions:
- Replace placeholder images with product photos
- Provide your catalog (CSV/JSON) and I'll import it into `products.json` and generate product pages if you want
- Integrate email/WhatsApp notifications or a payment gateway
