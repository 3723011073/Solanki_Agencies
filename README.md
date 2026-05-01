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

## Fly.io Deployment

This app runs on Fly.io as a Docker container.

1. Install the Fly CLI and sign in:

```powershell
fly auth login
```

2. Create the app once:

```powershell
fly launch --no-deploy
```

3. Set secrets in Fly:

```powershell
fly secrets set `
	RAZORPAY_KEY_ID=... `
	RAZORPAY_KEY_SECRET=... `
	ADMIN_EMAIL=solankiagencies07@gmail.com `
	ADMIN_PASSWORD=... `
	MYSQL_HOST=... `
	MYSQL_USER=... `
	MYSQL_PASSWORD=... `
	MYSQL_DATABASE=... `
	APP_BASE_URL=https://your-fly-domain.example
```

4. Deploy:

```powershell
fly deploy
```

5. Update GoDaddy DNS after Fly gives you the app hostname:
- Point `www` to the Fly hostname with a `CNAME` record.
- For the root domain, either use GoDaddy forwarding to `www` or set up an `A`/`ALIAS`-style solution supported by your DNS plan.
- Once the domain resolves, set `APP_BASE_URL` to the final public URL so reset-password and receipt links use the correct domain.

## GitHub Actions Deployment

Pushes to `main` can deploy automatically to Fly.io if you add these GitHub secrets:
- `FLY_API_TOKEN`
- `FLY_APP_NAME`

The workflow file in `.github/workflows/fly-deploy.yml` uses those secrets.

## Free Deployment Option: GitHub Pages

If you want the site live without paying for hosting, GitHub Pages is the best fit for this repository. It is a static deployment, so it publishes the HTML, CSS, JavaScript, images, and product pages directly from `main`.

What works on GitHub Pages:
- Home page and all static pages
- Product catalog and UI rendering
- Client-side cart flow and fallback data
- Documentation/report files in the repository

What does not run on GitHub Pages:
- `server.js`
- API routes such as authentication, bookings, Razorpay order creation, and receipt generation
- MySQL / email / server-side payment verification

Automatic deploy setup:
1. Push the repository to GitHub.
2. Open **Settings > Pages** in the repository.
3. Set **Build and deployment** to **GitHub Actions**.
4. Let the workflow in `.github/workflows/deploy-pages.yml` deploy on every push to `main`.

GoDaddy DNS steps for a custom domain:
1. Decide whether you want the root domain or `www` to open the site.
2. In GoDaddy DNS, point the domain to GitHub Pages.
3. For the root domain, add GitHub Pages A records.
4. For `www`, add a CNAME record to the GitHub Pages hostname.
5. In GitHub Pages settings, add the custom domain and enable HTTPS after DNS propagates.

Recommended live setup for this project:
- Use GitHub Pages now for the free public site.
- Keep the backend for local development or move it later to a paid/API host if bookings and payment processing must be live.

## Payment API Flow

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
- Configure production Razorpay keys in Railway and run one test transaction.
- Add payment webhook support for asynchronous reconciliation.
- Add stock reduction logic after successful payment.
