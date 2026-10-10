# Tic-hackathon
# PAU Connect — Campus Discovery Marketplace

**Your campus. Your marketplace.**

PAU Connect is a campus-focused discovery platform designed to connect students with student-owned businesses, products, services, and digital platforms within Pan-Atlantic University (PAU).

## The Problem

Students often struggle to discover businesses and services created by other students. Meanwhile, student entrepreneurs and platform builders find it difficult to reach their target audience.

This disconnect means students may miss useful campus offerings, while student businesses lose opportunities to grow and connect with potential customers.

## The Solution

PAU Connect brings student businesses and their potential customers together in one accessible platform. Students can discover products and services based on their needs, compare available options, and contact vendors directly.

Student entrepreneurs can showcase their offerings and reach a wider campus audience.

## Campus directory and bookings

The prototype opens on the business directory. Select a business to browse its
products or services, add listings to the booking cart, and confirm the booking
with a school email address ending exactly in `@pau.edu.ng`.

The FastAPI backend imports the `Platform Directory` and `Products & Offerings`
worksheets from `backend/Campus_Platform_Discovery_Data_v2.xlsx` on startup.
Directory IDs connect each offering to its business, and workbook prices and
promotions are kept as display strings. Price ranges use their starting amount
for booking totals. Club meeting times and locations display as “To be announced”
because the workbook does not specify them. The backend exposes:

- `GET /api/businesses` — list campus businesses.
- `GET /api/businesses/{business_id}` — fetch one business.
- `GET /api/businesses/{business_id}/products` — browse one business’s listings.
- `GET /api/products?business_id={id}` — filter listings by business.
- `POST /api/orders` — book cart items using `{ "pau_email": "...@pau.edu.ng", "items": [{ "product_id": 1, "quantity": 1 }] }`.

### Run locally

Start the API from the `backend/` directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8000/api`. Existing SQLite
product and order data is retained and linked to the seeded directory businesses
when the backend starts.
