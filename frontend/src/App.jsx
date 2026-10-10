import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, PlusCircle, User, Heart, ShoppingCart, 
  Store, Tag, Filter, Star, CheckCircle, Clock, Package, 
  Trash2, ArrowRight, ShieldCheck, CreditCard, Truck, AlertCircle,
  Menu, X, ExternalLink, RefreshCw, DollarSign
} from 'lucide-react';

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Digital Products",
  "Handmade & Crafts"
];

// Base URL for your Python FastAPI backend
const API_BASE_URL = "http://localhost:8000/api";

export default function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [userRole, setUserRole] = useState("buyer"); // 'buyer' or 'seller'
  const [currentView, setCurrentView] = useState("marketplace"); // 'marketplace', 'seller-dashboard'
  
  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Trigger toast notifications
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch products from Python backend on load or when filters change
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/products?`;
      if (selectedCategory && selectedCategory !== "All Categories") {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products from backend:", error);
      showToast("Error connecting to backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  // Add to cart helper
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`Added "${product.title}" to your cart!`);
  };

  // Toggle Wishlist
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        showToast(`Removed from wishlist.`);
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast(`Added to wishlist!`);
        return [...prev, product];
      }
    });
  };

  // Sort products client-side
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.reviewsCount - a.reviewsCount; // popular
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView("marketplace")}>
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                NexusMarket
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Connected to Python Backend</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search products in database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 border border-slate-200 rounded-full pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button 
                onClick={() => { setUserRole("buyer"); setCurrentView("marketplace"); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${userRole === 'buyer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Buyer
              </button>
              <button 
                onClick={() => { setUserRole("seller"); setCurrentView("seller-dashboard"); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${userRole === 'seller' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Seller Hub
              </button>
            </div>

            {userRole === 'buyer' && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-indigo-100 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cart.reduce((acc, item) => acc + item.qty, 0) > 0 && (
                  <span className="bg-white text-indigo-600 font-bold px-1.5 py-0.5 rounded-md text-xs">
                    {cart.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                )}
              </button>
            )}
        </div>
      </div>
    </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === 'buyer' && currentView === 'marketplace' && (
          <BuyerMarketplace 
            products={sortedProducts}
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            wishlist={wishlist}
            setSelectedProduct={setSelectedProduct}
            isLoading={isLoading}
          />
        )}

        {userRole === 'seller' && (
          <SellerDashboard 
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            showToast={showToast}
            fetchProducts={fetchProducts}
            fetchOrders={fetchOrders}
          />
        )}
      </main>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          isWishlisted={wishlist.some(w => w.id === selectedProduct.id)}
        />
    )}

    {isCartOpen && (
      <CartDrawer 
        cart={cart}
        setCart={setCart}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
    )}

    {isCheckoutOpen && (
      <CheckoutModal 
        cart={cart}
        setCart={setCart}
        onClose={() => setIsCheckoutOpen(false)}
        setOrders={setOrders}
        showToast={showToast}
        fetchOrders={fetchOrders}
      />
    )}
  </div>
  );
}

function BuyerMarketplace({ 
  products, categories, selectedCategory, setSelectedCategory, 
  sortBy, setSortBy, addToCart, toggleWishlist, wishlist, setSelectedProduct, isLoading
}) {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            <Tag className="w-3.5 h-3.5" /> FastAPI + SQLite Backend Live
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Discover Unique Products & Independent Creators
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            All data is saved in real-time to your Python backend database.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-500 font-medium">Loading products from Python backend...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-800">No products found</h3>
          <button onClick={() => setSelectedCategory("All Categories")} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const isWishlisted = wishlist.some(w => w.id === product.id);
            return (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group">
                <div className="relative aspect-[4/3] bg-slate-100 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
                    {product.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>By <strong className="text-slate-700">{product.seller}</strong></span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                    <h3 onClick={() => setSelectedProduct(product)} className="font-bold text-slate-800 text-base line-clamp-1 hover:text-indigo-600 cursor-pointer">
                      {product.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2">{product.description}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900">${product.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(product)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Buy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SellerDashboard({ products, setProducts, orders, setOrders, showToast, fetchProducts, fetchOrders }) {
  const [activeTab, setActiveTab] = useState("listings");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newStock, setNewStock] = useState("");

  const handleProductUpload = async (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newDescription) {
      showToast("Please fill in required fields.");
      return;
    }

    const payload = {
      title: newTitle,
      category: newCategory,
      price: parseFloat(newPrice),
      description: newDescription,
      image: newImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      seller: "Nexus Creator Hub (You)",
      stock: parseInt(newStock) || 10,
      shippingInfo: "Free Shipping"
    };

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showToast("Product successfully saved to Python database!");
        setNewTitle("");
        setNewPrice("");
        setNewDescription("");
        setNewImage("");
        setNewStock("");
        setActiveTab("listings");
        fetchProducts();
      } else {
        showToast("Failed to upload product.");
      }
    } catch (err) {
      showToast("Server connection error.");
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Product deleted successfully.");
        fetchProducts();
      }
    } catch (err) {
      showToast("Error deleting product.");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Order ${orderId} updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      showToast("Failed to update order.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold">Seller Control Center</h2>
          <p className="text-slate-400 text-sm">Linked directly to SQLite DB via FastAPI</p>
        </div>
        <div className="flex bg-white/10 p-1.5 rounded-2xl">
          <button onClick={() => setActiveTab("listings")} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'listings' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>Listings</button>
          <button onClick={() => setActiveTab("upload")} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>Upload</button>
          <button onClick={() => setActiveTab("orders")} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>Orders ({orders.length})</button>
        </div>
      </div>

      {activeTab === 'listings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between p-4">
              <div>
                <img src={product.image} alt={product.title} className="w-full h-40 object-cover rounded-xl mb-3" />
                <h4 className="font-bold">{product.title}</h4>
                <p className="text-indigo-600 font-black">${product.price.toFixed(2)}</p>
              </div>
              <button onClick={() => deleteProduct(product.id)} className="mt-4 p-2 text-rose-500 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'upload' && (
        <form onSubmit={handleProductUpload} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-2xl mx-auto space-y-4">
          <h3 className="text-2xl font-black">Upload New Product</h3>
          <input type="text" placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl" />
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl">
            {CATEGORIES.filter(c => c !== "All Categories").map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" step="0.01" placeholder="Price ($)" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl" />
          <input type="number" placeholder="Stock" value={newStock} onChange={e => setNewStock(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl" />
          <input type="text" placeholder="Image URL" value={newImage} onChange={e => setNewImage(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl" />
          <textarea placeholder="Description" value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl"></textarea>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Save to Database</button>
        </form>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-2xl border flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-indigo-600">{order.id}</span>
                <h4 className="font-bold">{order.productTitle} (x{order.quantity})</h4>
                <p className="text-xs text-slate-500">Buyer: {order.buyerName} | Address: {order.shippingAddress}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black">${order.total.toFixed(2)}</span>
                <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} className="border p-2 rounded-xl text-xs">
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductDetailModal({ product, onClose, addToCart, toggleWishlist, isWishlisted }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full">✕</button>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          <div className="p-6 space-y-4">
            <span className="text-xs font-bold text-indigo-600">{product.category}</span>
            <h2 className="text-2xl font-black">{product.title}</h2>
            <p className="text-slate-600 text-sm">{product.description}</p>
            <div className="text-2xl font-black">${product.price.toFixed(2)}</div>
            <button onClick={() => { addToCart(product); onClose(); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, setCart, onClose, onOpenCheckout }) {
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Your Cart</h3>
            <button onClick={onClose}>✕</button>
          </div>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-bold text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500">${item.price} x {item.qty}</p>
              </div>
              <span className="font-bold">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-4 pt-4 border-t">
          <div className="flex justify-between font-black text-lg"><span>Total:</span><span>${total.toFixed(2)}</span></div>
          <button onClick={onOpenCheckout} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ cart, setCart, onClose, setOrders, showToast, fetchOrders }) {
  const [buyerName, setBuyerName] = useState("");
  const [address, setAddress] = useState("");

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!buyerName || !address || cart.length === 0) {
      showToast("Please enter name and address.");
      return;
    }

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const orderPayload = {
      productTitle: cart.map(i => `${i.title} (x${i.qty})`).join(', '),
      quantity: cart.reduce((acc, i) => acc + i.qty, 0),
      total: total,
      buyerName: buyerName,
      shippingAddress: address
    };

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        showToast("Order placed successfully in Python DB!");
        setCart([]);
        onClose();
        fetchOrders();
      }
    } catch (err) {
      showToast("Checkout error.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <form onSubmit={handleCheckout} className="bg-white rounded-3xl max-w-md w-full p-8 space-y-4 shadow-2xl">
        <h3 className="text-2xl font-black">Secure Checkout</h3>
        <input type="text" placeholder="Full Name" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl" required />
        <textarea placeholder="Shipping Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl" required></textarea>
        <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Complete Order</button>
      </form>
    </div>
  );
}