# Simple in-memory data store for the prototype
INITIAL_PRODUCTS = [
    {
        "id": 1,
        "title": "Wireless Noise-Canceling Headphones",
        "category": "Electronics",
        "price": 149.99,
        "rating": 4.8,
        "reviewsCount": 128,
        "description": "Experience crystal-clear sound and industry-leading noise cancellation. Perfect for travel, work, and relaxation with 30-hour battery life.",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        "seller": "TechVibe Global",
        "stock": 24,
        "shippingInfo": "Free Shipping - Arrives in 2-3 days"
    },
    {
        "id": 2,
        "title": "Minimalist Leather Backpack",
        "category": "Fashion",
        "price": 89.50,
        "rating": 4.6,
        "reviewsCount": 64,
        "description": "Handcrafted from genuine full-grain leather. Features a padded laptop compartment, durable brass hardware, and a sleek modern profile.",
        "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
        "seller": "Artisan Leathers",
        "stock": 12,
        "shippingInfo": "$5.99 Flat Rate Shipping"
    },
    {
        "id": 3,
        "title": "Smart Ceramic Pour-Over Coffee Maker",
        "category": "Home & Kitchen",
        "price": 45.00,
        "rating": 4.9,
        "reviewsCount": 210,
        "description": "Brew barista-quality coffee at home. Includes heat-resistant ceramic dripper, wooden collar, and reusable stainless steel mesh filter.",
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
        "seller": "BrewMaster Co.",
        "stock": 45,
        "shippingInfo": "Free Shipping on orders over $35"
    }
]

INITIAL_ORDERS = [
    {
        "id": "ORD-9821",
        "productTitle": "Minimalist Leather Backpack",
        "quantity": 1,
        "total": 89.50,
        "status": "Shipped",
        "buyerName": "Alex Johnson",
        "date": "2026-10-08",
        "shippingAddress": "123 Maple Street, Apt 4B, New York, NY"
    }
]

# runtime copies (mutable)
PRODUCTS = [p.copy() for p in INITIAL_PRODUCTS]
ORDERS = [o.copy() for o in INITIAL_ORDERS]
