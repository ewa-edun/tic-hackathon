from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Column, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# --- DATABASE SETUP (SQLITE) ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./nexusmarket.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fixed SQLAlchemy 2.0 import warning
Base = declarative_base()


class ProductModel(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    price = Column(Float, nullable=False)
    rating = Column(Float, default=5.0)
    reviewsCount = Column(Integer, default=1)
    description = Column(Text, nullable=False)
    image = Column(String, nullable=False)
    seller = Column(String, nullable=False)
    stock = Column(Integer, default=10)
    shippingInfo = Column(String, default="Free Shipping")


class OrderModel(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)
    productTitle = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String, default="Processing")  # Processing, Shipped, Delivered
    buyerName = Column(String, nullable=False)
    date = Column(String, nullable=False)
    shippingAddress = Column(String, nullable=False)


Base.metadata.create_all(bind=engine)


# --- LIFESPAN HANDLER (Replaces deprecated @app.on_event) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup seeding logic
    db = SessionLocal()
    try:
        if db.query(ProductModel).count() == 0:
            initial_products = [
                ProductModel(
                    title="Wireless Noise-Canceling Headphones",
                    category="Electronics",
                    price=149.99,
                    rating=4.8,
                    reviewsCount=128,
                    description="Experience crystal-clear sound and industry-leading noise cancellation. Perfect for travel, work, and relaxation with 30-hour battery life.",
                    image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                    seller="TechVibe Global",
                    stock=24,
                    shippingInfo="Free Shipping - Arrives in 2-3 days",
                ),
                ProductModel(
                    title="Minimalist Leather Backpack",
                    category="Fashion",
                    price=89.50,
                    rating=4.6,
                    reviewsCount=64,
                    description="Handcrafted from genuine full-grain leather. Features a padded laptop compartment, durable brass hardware, and a sleek modern profile.",
                    image="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
                    seller="Artisan Leathers",
                    stock=12,
                    shippingInfo="$5.99 Flat Rate Shipping",
                ),
                ProductModel(
                    title="Smart Ceramic Pour-Over Coffee Maker",
                    category="Home & Kitchen",
                    price=45.00,
                    rating=4.9,
                    reviewsCount=210,
                    description="Brew barista-quality coffee at home. Includes heat-resistant ceramic dripper, wooden collar, and reusable stainless steel mesh filter.",
                    image="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
                    seller="BrewMaster Co.",
                    stock=45,
                    shippingInfo="Free Shipping on orders over $35",
                ),
                ProductModel(
                    title="UI/UX Design System & Wireframe Kit",
                    category="Digital Products",
                    price=29.99,
                    rating=5.0,
                    reviewsCount=85,
                    description="A comprehensive Figma design system featuring 500+ components, auto-layout blocks, and responsive typography scales for rapid prototyping.",
                    image="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
                    seller="PixelCraft Studio",
                    stock=999,
                    shippingInfo="Instant Digital Download via Email",
                ),
                ProductModel(
                    title="Hand-Carved Wooden Plant Stand",
                    category="Handmade & Crafts",
                    price=38.00,
                    rating=4.7,
                    reviewsCount=32,
                    description="Sustainably sourced solid pine plant stand. Finished with natural organic beeswax to highlight rich wood grains. Supports pots up to 12 inches.",
                    image="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80",
                    seller="GreenThumb Crafts",
                    stock=8,
                    shippingInfo="$8.50 Standard Shipping",
                ),
            ]
            db.add_all(initial_products)
            db.commit()

        if db.query(OrderModel).count() == 0:
            initial_orders = [
                OrderModel(
                    id="ORD-9821",
                    productTitle="Minimalist Leather Backpack",
                    quantity=1,
                    total=89.50,
                    status="Shipped",
                    buyerName="Alex Johnson",
                    date="2026-10-08",
                    shippingAddress="123 Maple Street, Apt 4B, New York, NY",
                ),
                OrderModel(
                    id="ORD-9822",
                    productTitle="Smart Ceramic Pour-Over Coffee Maker",
                    quantity=2,
                    total=90.00,
                    status="Processing",
                    buyerName="Sarah Connor",
                    date="2026-10-09",
                    shippingAddress="456 Oak Avenue, Austin, TX",
                ),
            ]
            db.add_all(initial_orders)
            db.commit()
    finally:
        db.close()
    yield


# --- FASTAPI APP INITIALIZATION ---
app = FastAPI(
    title="NexusMarket API",
    description="Backend API for Platform Discovery and E-Commerce Marketplace",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- PYDANTIC SCHEMAS (Fixed Pydantic v2 warnings) ---
class ProductCreate(BaseModel):
    title: str
    category: str
    price: float
    description: str
    image: Optional[str] = (
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
    )
    seller: Optional[str] = "Nexus Creator Hub"
    stock: int = 10
    shippingInfo: Optional[str] = "Free Shipping"


class ProductResponse(ProductCreate):
    id: int
    rating: float
    reviewsCount: int

    model_config = ConfigDict(from_attributes=True)


class OrderItem(BaseModel):
    productTitle: str
    quantity: int
    total: float
    buyerName: str
    shippingAddress: str


class OrderResponse(OrderItem):
    id: str
    status: str
    date: str

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: str


# --- API ENDPOINTS ---


@app.get("/")
def read_root():
    return {
        "message": "Welcome to NexusMarket API",
        "docs": "/docs",
    }


# 1. Get all products (with optional search and category filters)
@app.get("/api/products", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(ProductModel)
    if category and category != "All Categories":
        query = query.filter(ProductModel.category == category)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ProductModel.title.ilike(search_filter))
            | (ProductModel.description.ilike(search_filter))
            | (ProductModel.seller.ilike(search_filter))
        )
    return query.all()


# 2. Upload a new product (Seller Hub)
@app.post(
    "/api/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = ProductModel(
        title=product.title,
        category=product.category,
        price=product.price,
        description=product.description,
        image=product.image,
        seller=product.seller,
        stock=product.stock,
        shippingInfo=product.shippingInfo,
        rating=5.0,
        reviewsCount=1,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


# 3. Delete a product
@app.delete("/api/products/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(ProductModel).filter(ProductModel.id == product_id).first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully", "id": product_id}


# 4. Get all customer orders (Seller Hub)
@app.get("/api/orders", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(OrderModel).all()


# 5. Place a new order (Checkout simulation)
@app.post(
    "/api/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED
)
def create_order(order: OrderItem, db: Session = Depends(get_db)):
    order_id = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')[-4:]}"
    current_date = datetime.now().strftime("%Y-%m-%d")

    db_order = OrderModel(
        id=order_id,
        productTitle=order.productTitle,
        quantity=order.quantity,
        total=order.total,
        status="Processing",
        buyerName=order.buyerName,
        date=current_date,
        shippingAddress=order.shippingAddress,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


# 6. Update order status (Processing -> Shipped -> Delivered)
@app.patch("/api/orders/{order_id}", response_model=OrderResponse)
def update_order_status(
    order_id: str, payload: OrderStatusUpdate, db: Session = Depends(get_db)
):
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order