# PAU Connect — Campus Discovery Marketplace

**Your campus. Your marketplace.**

PAU Connect is a campus-focused discovery platform designed to connect students with student-owned businesses, products, services, and digital platforms within Pan-Atlantic University (PAU).

## The Problem

Students often struggle to discover businesses and services created by other students. Meanwhile, student entrepreneurs and platform builders find it difficult to reach their target audience.

This disconnect means students may miss useful campus offerings, while student businesses lose opportunities to grow and connect with potential customers.

## The Solution

PAU Connect brings student businesses and their potential customers together in one accessible platform. Students can discover products and services based on their needs, compare available options, and contact vendors directly.

Student entrepreneurs can showcase their offerings and reach a wider campus audience.

## Key Features

- **Business Discovery:** Browse student businesses, products, and services in one place.
- **Search and Filtering:** Find relevant offerings by name, keyword, or category.
- **Product and Service Listings:** View descriptions, prices, images, and vendor information.
- **Vendor Contact:** Connect directly with vendors through available contact links.
- **Business Submission:** Give student entrepreneurs a way to submit their businesses and offerings.
- **Responsive Interface:** Access the platform on desktop and mobile devices.

## Target Users

- **Students:** Discover useful products, services, and platforms within the PAU community.
- **Student Entrepreneurs:** Showcase products and services to potential customers.
- **Student Platform Builders:** Increase the visibility and discoverability of their digital solutions.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development and build tooling |
| Tailwind CSS | Styling and responsive layouts |
| Python | Backend programming |
| Flask | Backend API and request handling |

## Project Structure

```text
pau-connect/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app.py
│   ├── data.py
│   └── requirements.txt
│
└── README.md
```

*This structure is a proposed starting point and can be adjusted as development progresses.*

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js and npm
- Python 3
- pip

### 1. Clone the repository

```bash
git clone <repository-url>
cd pau-connect
```

### 2. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL provided by Vite in your browser.

### 3. Set up the backend

Open a second terminal:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

The Flask server should start at the local address configured in the application.

**Note:** The commands above assume the corresponding files, dependencies, and Flask startup configuration have been created.

## Project Goals

The initial prototype aims to:

1. Make campus businesses and services easier to discover.
2. Reduce the gap between student entrepreneurs and potential customers.
3. Provide a simple, accessible way to browse and contact vendors.
4. Demonstrate how a shared digital platform can strengthen the campus entrepreneurial ecosystem.

## Future Improvements

Potential future additions include:

- Student accounts and vendor dashboards.
- Verified business profiles and customer reviews.
- Favourites and personalised recommendations.
- Listing availability and inventory management.
- Analytics to help vendors understand customer interest.
- Demand tracking to identify services students need but cannot find.
- Persistent database storage and online deployment.

## Built For

**Pan-Atlantic University Tech Innovation Club — Platform Discovery Stream**

A prototype exploring how technology can improve discovery, visibility, and connections between students and the businesses and platforms serving their community.




uvicorn main:app --reload --port 8000
