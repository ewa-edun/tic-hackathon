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

const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: "Wireless Noise-Canceling Headphones",
    category: "Electronics",
    price: 149.99,
    rating: 4.8,
    reviewsCount: 128,
    description: "Experience crystal-clear sound and industry-leading noise cancellation. Perfect for travel, work, and relaxation with 30-hour battery life.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    seller: "TechVibe Global",
    stock: 24,
    shippingInfo: "Free Shipping - Arrives in 2-3 days"
  },
  {
    id: 2,
    title: "Minimalist Leather Backpack",
    category: "Fashion",
    price: 89.50,
    rating: 4.6,
    reviewsCount: 64,
    description: "Handcrafted from genuine full-grain leather. Features a padded laptop compartment, durable brass hardware, and a sleek modern profile.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    seller: "Artisan Leathers",
    stock: 12,
    shippingInfo: "$5.99 Flat Rate Shipping"
  },
  {
    id: 3,
    title: "Smart Ceramic Pour-Over Coffee Maker",
    category: "Home & Kitchen",
    price: 45.00,
    rating: 4.9,
    reviewsCount: 210,
    description: "Brew barista-quality coffee at home. Includes heat-resistant ceramic dripper, wooden collar, and reusable stainless steel mesh filter.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    seller: "BrewMaster Co.",
    stock: 45,
    shippingInfo: "Free Shipping on orders over $35"
  },
  {
    id: 4,
    title: "UI/UX Design System & Wireframe Kit",
    category: "Digital Products",
    price: 29.99,
    rating: 5.0,
    reviewsCount: 85,
    description: "A comprehensive Figma design system featuring 500+ components, auto-layout blocks, and responsive typography scales for rapid prototyping.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
    seller: "PixelCraft Studio",
    stock: 999,
    shippingInfo: "Instant Digital Download via Email"
  },
  {
    id: 5,
    title: "Hand-Carved Wooden Plant Stand",
    category: "Handmade & Crafts",
    price: 38.00,
    rating: 4.7,
    reviewsCount: 32,
    description: "Sustainably sourced solid pine plant stand. Finished with natural organic beeswax to highlight rich wood grains. Supports pots up to 12 inches.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80",
    seller: "GreenThumb Crafts",
    stock: 8,
    shippingInfo: "$8.50 Standard Shipping"
  },
  {
    id: 6,
    title: "Mechanical RGB Gaming Keyboard",
    category: "Electronics",
    price: 119.00,
    rating: 4.5,
    reviewsCount: 94,
    description: "Hot-swappable mechanical switches with customizable RGB backlighting, durable PBT keycaps, and ultra-low latency wireless connectivity.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    seller: "TechVibe Global",
    stock: 15,
    shippingInfo: "Free Shipping"
  }
];

const INITIAL_ORDERS = [
  {
    id: "ORD-9821",
    productTitle: "Minimalist Leather Backpack",
    quantity: 1,
    total: 89.50,
    status: "Shipped",
    buyerName: "Alex Johnson",
    date: "2026-10-08",
    shippingAddress: "123 Maple Street, Apt 4B, New York, NY"
  },
  {
    id: "ORD-9822",
    productTitle: "Smart Ceramic Pour-Over Coffee Maker",
    quantity: 2,
    total: 90.00,
    status: "Processing",
    buyerName: "Sarah Connor",
    date: "2026-10-09",
    shippingAddress: "456 Oak Avenue, Austin, TX"
  }
];

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

  // Load products & orders from backend when available
  useEffect(() => {
    let mounted = true;
    fetch('/api/products')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => { if (mounted) setProducts(data); })
      .catch(() => {
        // fallback to initial data embedded in the file
        setProducts(INITIAL_PRODUCTS);
      });

    fetch('/api/orders')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => { if (mounted) setOrders(data); })
      .catch(() => {
        setOrders(INITIAL_ORDERS);
      });

    return () => { mounted = false; };
  }, []);

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

  // Filter and sort products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "All Categories" || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
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

      {/* Top Banner / Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView("marketplace")}>
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                NexusMarket
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Platform Discovery & E-Commerce</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search products, digital assets, handmade items, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 border border-slate-200 rounded-full pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Nav Actions & Role Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Role Switcher */}
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

            {/* Wishlist Button */}
            {userRole === 'buyer' && (
              <button 
                onClick={() => showToast(`You have ${wishlist.length} items in your wishlist.`)}
                className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
            )}

            {/* Cart Button */}
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

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-full pl-11 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === 'buyer' && currentView === 'marketplace' && (
          <BuyerMarketplace 
            products={filteredProducts}
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            wishlist={wishlist}
            setSelectedProduct={setSelectedProduct}
          />
        )}

        {userRole === 'seller' && (
          <SellerDashboard 
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            showToast={showToast}
          />
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          isWishlisted={wishlist.some(w => w.id === selectedProduct.id)}
        />
      )}

      {/* Cart Drawer */}
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

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal 
          cart={cart}
          setCart={setCart}
          onClose={() => setIsCheckoutOpen(false)}
          setOrders={setOrders}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function BuyerMarketplace({ 
  products, categories, selectedCategory, setSelectedCategory, 
  sortBy, setSortBy, addToCart, toggleWishlist, wishlist, setSelectedProduct 
}) {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            <Tag className="w-3.5 h-3.5" /> NexusMarket Creators & Discover Hub
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Discover Unique Products & Independent Creators
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Explore cutting-edge tech, handmade crafts, digital assets, and high-end fashion directly from verified global sellers.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Controls Bar: Count & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Package className="w-4 h-4 text-indigo-600" />
          <span>Showing <strong className="text-slate-900">{products.length}</strong> available products</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No products found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            We couldn't find any items matching your current filters or search query. Try clearing your search.
          </p>
          <button 
            onClick={() => setSelectedCategory("All Categories")} 
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const isWishlisted = wishlist.some(w => w.id === product.id);
            return (
              <div 
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                    {product.category}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
                      isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>By <strong className="text-slate-700">{product.seller}</strong></span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 
                      onClick={() => setSelectedProduct(product)}
                      className="font-bold text-slate-800 text-base line-clamp-1 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      {product.title}
                    </h3>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Price</span>
                      <span className="text-lg font-black text-slate-900">${product.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => addToCart(product)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Buy
                      </button>
                    </div>
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

function SellerDashboard({ products, setProducts, orders, setOrders, showToast }) {
  const [activeTab, setActiveTab] = useState("listings"); // 'listings', 'upload', 'orders'
  
  // New Product Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newShipping, setNewShipping] = useState("Free Shipping");

  const handleProductUpload = (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newDescription) {
      showToast("Please fill in all required product fields.");
      return;
    }

    const createdProduct = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      price: parseFloat(newPrice),
      rating: 5.0,
      reviewsCount: 1,
      description: newDescription,
      image: newImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      seller: "Nexus Creator Hub (You)",
      stock: parseInt(newStock) || 10,
      shippingInfo: newShipping
    };

    setProducts([createdProduct, ...products]);
    showToast("Product successfully uploaded to marketplace!");
    
    // Reset form
    setNewTitle("");
    setNewPrice("");
    setNewDescription("");
    setNewImage("");
    setNewStock("");
    setActiveTab("listings");
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order ${orderId} status updated to ${newStatus}`);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    showToast("Product removed successfully.");
  };

  return (
    <div className="space-y-8">
      {/* Seller Header banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Store className="w-3.5 h-3.5" /> Seller Control Center
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Manage Your Storefront</h2>
          <p className="text-slate-400 text-sm">Upload new inventory, review incoming customer orders, and track revenue.</p>
        </div>

        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
          <button 
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'listings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            My Listings ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            Upload Product
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            Customer Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Active Products in Marketplace</h3>
            <button 
              onClick={() => setActiveTab("upload")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-indigo-600">
                      {product.category}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-base line-clamp-1">{product.title}</h4>
                      <span className="text-indigo-600 font-extrabold">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                  <span className="text-xs font-medium text-slate-500">Stock: <strong className="text-slate-800">{product.stock} units</strong></span>
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD PRODUCT FORM */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-3xl mx-auto">
          <div className="mb-6 space-y-1">
            <h3 className="text-2xl font-black text-slate-900">Upload New Product</h3>
            <p className="text-sm text-slate-500">List your item across the platform discovery engine for thousands of active buyers.</p>
          </div>

          <form onSubmit={handleProductUpload} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Title *</label>
                <input 
                  type="text"
                  placeholder="e.g. Smart Wireless Earbuds"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category *</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.filter(c => c !== "All Categories").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price ($) *</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="49.99"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Stock Quantity *</label>
                <input 
                  type="number"
                  placeholder="25"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Image URL (Unsplash or direct link)</label>
              <input 
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Description *</label>
              <textarea 
                rows="4"
                placeholder="Provide details about features, materials, and benefits..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" /> Publish Product Listing
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Incoming Customer Orders</h3>
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">
              {orders.length} Total Orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Order ID</th>
                  <th className="pb-3 px-4">Product</th>
                  <th className="pb-3 px-4">Buyer</th>
                  <th className="pb-3 px-4">Total</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4 font-mono font-bold text-indigo-600">{order.id}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{order.productTitle}</td>
                    <td className="py-4 px-4 text-slate-600">{order.buyerName}</td>
                    <td className="py-4 px-4 font-black text-slate-900">${order.total.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetailModal({ product, onClose, addToCart, toggleWishlist, isWishlisted }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Product Image */}
        <div className="md:w-1/2 relative bg-slate-100">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover min-h-[300px]" />
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 bg-white/80 rounded-full text-slate-700 shadow-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
                {product.category}
              </span>
              <button 
                onClick={onClose}
                className="hidden md:block text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-black text-slate-900">{product.title}</h2>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-indigo-600">${product.price.toFixed(2)}</span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Store className="w-4 h-4 text-indigo-600" />
                <span>Sold by: <strong>{product.seller}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>{product.shippingInfo}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Buyer Protection Guarantee included</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button 
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-2xl border transition-all ${
                isWishlisted ? 'bg-rose-50 text-rose-500 border-rose-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={() => { addToCart(product); onClose(); }}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart & Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, setCart, onClose, onOpenCheckout }) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shipping = subtotal > 0 ? 5.99 : 0.00;
  const total = subtotal + (subtotal > 0 ? shipping : 0);

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-black text-slate-900">Your Shopping Cart</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800">Your cart is empty</h4>
              <p className="text-xs text-slate-500">Discover amazing products and add them to your cart.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h4>
                    <span className="text-indigo-600 font-extrabold text-sm">${item.price.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1">
                      <button onClick={() => updateQty(item.id, -1)} className="text-slate-600 font-bold px-1">-</button>
                      <span className="text-xs font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="text-slate-600 font-bold px-1">+</button>
                    </div>

                    <button 
                      onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={onOpenCheckout}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({ cart, setCart, onClose, setOrders, showToast }) {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = subtotal + 5.99;

  const handleCompleteOrder = (e) => {
    e.preventDefault();
    if (!name || !address) {
      showToast("Please fill in your shipping details.");
      return;
    }

    const newOrders = cart.map((item, idx) => ({
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productTitle: item.title,
      quantity: item.qty,
      total: item.price * item.qty,
      status: "Processing",
      buyerName: name,
      date: new Date().toISOString().split('T')[0],
      shippingAddress: address
    }));

    // Attempt to POST the order to backend; fall back to local update on failure
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, buyerName: name, shippingAddress: address })
    }).then(r => {
      if (r.ok) return r.json();
      throw new Error('post-failed');
    }).then(created => {
      setOrders(prev => [...created, ...prev]);
      setCart([]);
      setStep(3);
      showToast("Order placed successfully!");
    }).catch(() => {
      const newOrders = cart.map((item, idx) => ({
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        productTitle: item.title,
        quantity: item.qty,
        total: item.price * item.qty,
        status: "Processing",
        buyerName: name,
        date: new Date().toISOString().split('T')[0],
        shippingAddress: address
      }));

      setOrders(prev => [...newOrders, ...prev]);
      setCart([]);
      setStep(3);
      showToast("Order placed successfully! (local fallback)");
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 p-8 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-xl font-black text-slate-900">
            {step === 3 ? "Order Confirmed!" : "Secure Checkout"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); if(name && address) setStep(2); else showToast("Please fill in all details."); }} className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Shipping Information</h4>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Full Name</label>
              <input 
                type="text" 
                placeholder="Alex Johnson" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Shipping Address</label>
              <textarea 
                rows="3" 
                placeholder="123 Main Street, Apt 4B, City, Country" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              Continue to Payment <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCompleteOrder} className="space-y-6">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Payment Method</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button" 
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-slate-200 text-slate-600'}`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-xs font-bold">Credit Card</span>
              </button>
              <button 
                type="button" 
                onClick={() => setPaymentMethod("paypal")}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'paypal' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-slate-200 text-slate-600'}`}
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-xs font-bold">PayPal</span>
              </button>
              <button 
                type="button" 
                onClick={() => setPaymentMethod("cod")}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-slate-200 text-slate-600'}`}
              >
                <Package className="w-6 h-6" />
                <span className="text-xs font-bold">Cash on Del.</span>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Card Number</label>
                  <input type="text" placeholder="4532 •••• •••• 8921" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM / YY" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <input type="text" placeholder="CVC" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center text-sm font-bold">
              <span>Total Due:</span>
              <span className="text-indigo-600 text-lg">${total.toFixed(2)}</span>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="px-5 py-3.5 border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Back
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all"
              >
                Complete Order (${total.toFixed(2)})
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 py-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-slate-900">Thank You For Your Order!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your order has been placed and transmitted to the respective sellers. You can track status in your order history.
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}