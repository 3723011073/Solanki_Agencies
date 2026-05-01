# Solanki Agencies - E-commerce Site

This workspace contains a multi-page e-commerce site for Solanki Agencies with:
- Product catalog from `products.json`
- User/admin authentication
- Cart and checkout flow
- Razorpay payment integration
- Payment receipt generation
- Booking history

Pages:
- `index.html` — Home
- `about.html` — About Us
- `products.html` — Products (live catalog)
- `booking.html` — Cart and checkout entry
- `payment.html` — Razorpay payment page
- `receipt.html` — Payment receipt
- `history.html` — Booking history
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
- The server provides catalog, booking, auth, and payment APIs.
- Frontend will attempt to fetch products from `/api/products` and falls back to embedded sample data when the API is not available (useful if opening files without the server).

## Razorpay Setup

Add these variables in your local `.env` (and Railway service variables):

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
ADMIN_EMAIL=solankiagencies07@gmail.com
ADMIN_PASSWORD=your_password
PORT=5500
```

Optional for receipt emails:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_SECURE=false
RECEIPT_FROM_EMAIL=your_email@example.com
```

## Recommended Deployment: Render + GitHub + GoDaddy

This project is already a single Express app that serves both the frontend and the API from `server.js`, so Render can host it as one web service with automatic deploys from GitHub.

Why this is the best free-first option:
- One service runs the UI, API, and payment flow together.
- Pushes to GitHub can deploy automatically to Render.
- Your GoDaddy domain can point to the Render service with standard DNS records.

What works on Render:
- All HTML/CSS/JS pages
- API routes in `server.js`
- Razorpay order creation and verification
- Email sending if SMTP is configured

Important free-tier note:
- Render free web services can sleep when idle.
- File-based data in `bookings.json`, `payments.json`, and in-memory auth data is not ideal for long-term production storage on a free instance.
- If the client needs durable orders, users, and payments, connect a persistent database before going fully live.

### 1. Connect GitHub to Render

1. Push this repository to GitHub.
2. Sign in to Render with GitHub.
3. Create a new **Blueprint** service from the repository.
4. Render will read [`render.yaml`](render.yaml) and create the service automatically.
5. Keep **Auto-Deploy** enabled so every push to `main` redeploys the app.

### 2. Set Render environment variables

Add the real production values in the Render dashboard:

```env
ADMIN_EMAIL=solankiagencies07@gmail.com
ADMIN_PASSWORD=your_admin_password
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_SECURE=false
RECEIPT_FROM_EMAIL=your_email@example.com
MYSQL_HOST=your_mysql_host
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=solanki_agencies
MYSQL_PORT=3306
MYSQL_SSL=true
APP_BASE_URL=https://your-final-domain.example
```

If you do not use MySQL, the app falls back to local in-memory auth for development, but that is not durable for production.

### 3. Render app settings

Use these values in the Render web service:
- Build command: `npm ci`
- Start command: `npm start`
- Runtime: Node
- Health check path: `/`

The app listens on `process.env.PORT`, so Render can assign the port automatically.

### 4. GoDaddy DNS setup

Use GoDaddy after Render gives you the service URL:

1. In Render, add your custom domain, preferably `www.yourdomain.com`.
2. In GoDaddy DNS, create a `CNAME` record:
   - Host: `www`
   - Points to: your Render service hostname, for example `solanki-agencies.onrender.com`
3. For the root domain `yourdomain.com`, either:
   - use GoDaddy forwarding to redirect `yourdomain.com` to `www.yourdomain.com`, or
   - use a DNS provider that supports apex flattening if you want the root to point directly.
4. After DNS updates, set `APP_BASE_URL` in Render to the final public URL.
5. Enable HTTPS in Render after the domain verifies.

Recommended live setup:
- Use Render for the app hosting.
- Use GitHub for automatic deploys.
- Use GoDaddy only for domain registration and DNS.

## Payment Flow

1. `GET /api/payment/config` checks if Razorpay is configured.
2. `POST /api/payment/create-order` creates a Razorpay order.
3. Razorpay Checkout completes payment in browser.
4. `POST /api/payment/verify` validates signature and finalizes order.
5. `GET /api/payment/receipt/:orderId` fetches receipt details.

Security notes:
- Cart totals are recomputed server-side from `products.json`.
- Client-side price tampering is rejected.
- Payment verification is signature-based and idempotent.
- Successful payment auto-creates booking history.

Next steps / suggestions:
- Configure production Razorpay keys in Render and run one test transaction.
- Add payment webhook support for asynchronous reconciliation.
- Add stock reduction logic after successful payment.
