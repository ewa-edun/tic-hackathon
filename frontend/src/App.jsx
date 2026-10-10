import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Heart,
  LoaderCircle,
  Mail,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  Users,
  X,
} from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api';
const PAU_EMAIL_PATTERN = /^[^\s@]+@pau\.edu\.ng$/;
const FAVORITES_STORAGE_KEY = 'pauconnect:favorites:v1';
const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);

function getBusinessImage(business) {
  const details = `${business.org_name} ${business.category}`.toLowerCase();
  if (/nail|cosmetic|makeup/.test(details)) {
    return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1000&auto=format&fit=crop&q=85';
  }
  if (/fashion|cloth|apparel|style|tailor/.test(details)) {
    return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=85';
  }
  if (/beauty|glam/.test(details)) {
    return 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1000&auto=format&fit=crop&q=85';
  }
  if (/tech|digital|phone|gadget|computer/.test(details)) {
    return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=85';
  }
  if (/food|snack|drink|grocery|meal/.test(details)) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=85';
  }
  if (/book|academic|print|education/.test(details)) {
    return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000&auto=format&fit=crop&q=85';
  }
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=85';
}

function getInitials(name) {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function readSavedProducts() {
  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.filter(
          (product) =>
            Number.isSafeInteger(product?.id) &&
            typeof product.title === 'string' &&
            Number.isFinite(product.price) &&
            Number.isFinite(product.stock),
        )
      : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [activeClub, setActiveClub] = useState(null);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState(readSavedProducts);
  const [promoCodes, setPromoCodes] = useState([]);
  const [cart, setCart] = useState([]);
  const [businessSearch, setBusinessSearch] = useState('');
  const [isFavoritesView, setIsFavoritesView] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [promoError, setPromoError] = useState('');
  const [notice, setNotice] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBusinesses() {
      try {
        const response = await fetch(`${API_BASE_URL}/businesses`);
        if (!response.ok) throw new Error('Could not load businesses.');
        const data = await response.json();
        if (!cancelled) setBusinesses(data);

        const promoResponse = await fetch(`${API_BASE_URL}/promo-codes`);
        if (!promoResponse.ok) {
          throw new Error('Could not load current business promo codes.');
        }
        const promoData = await promoResponse.json();
        if (!cancelled) {
          setPromoCodes((current) => [
            ...current.filter(
              (promo) => !promoData.some((item) => item.code === promo.code),
            ),
            ...promoData,
          ]);
        }
      } catch (error) {
        if (!cancelled) setNotice(error.message || 'Could not connect to PAU Connect.');
      } finally {
        if (!cancelled) setLoadingBusinesses(false);
      }
    }

    loadBusinesses();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeBusiness) return undefined;
    let cancelled = false;

    async function loadBusinessPromoCodes() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/promo-codes?business_id=${activeBusiness.id}`,
        );
        if (!response.ok) throw new Error('Could not load this business’s offers.');
        const data = await response.json();
        if (!cancelled) {
          setPromoCodes((current) => [
            ...current.filter((promo) => promo.business_id !== activeBusiness.id),
            ...data,
          ]);
        }
      } catch (error) {
        if (!cancelled) setNotice(error.message || 'Could not load business offers.');
      }
    }

    loadBusinessPromoCodes();
    return () => {
      cancelled = true;
    };
  }, [activeBusiness]);

  useEffect(() => {
    if (!activeBusiness) return undefined;
    let cancelled = false;

    async function loadBusinessProducts() {
      setLoadingProducts(true);
      setProducts([]);
      try {
        const response = await fetch(
          `${API_BASE_URL}/businesses/${activeBusiness.id}/products`,
        );
        if (!response.ok) throw new Error('Could not load this business’s listings.');
        const data = await response.json();
        if (!cancelled) setProducts(data);
      } catch (error) {
        if (!cancelled) setNotice(error.message || 'Could not load this business.');
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    loadBusinessProducts();
    return () => {
      cancelled = true;
    };
  }, [activeBusiness]);

  const filteredBusinesses = useMemo(() => {
    const search = businessSearch.trim().toLowerCase();
    return businesses.filter((business) =>
      business.tag.toLowerCase() !== 'club' &&
      (!search ||
      [business.org_name, business.tag, business.category, business.handles]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))),
    );
  }, [businessSearch, businesses]);

  const filteredClubs = useMemo(() => {
    const search = businessSearch.trim().toLowerCase();
    return businesses.filter((business) =>
      business.tag.toLowerCase() === 'club' &&
      (!search ||
      [business.org_name, business.tag, business.category, business.handles]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))),
    );
  }, [businessSearch, businesses]);

  const itemCount = cart.reduce((count, item) => count + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const promoDiscount = appliedPromo?.discount_amount || 0;
  const checkoutTotal = Math.max(0, cartTotal - promoDiscount);
  const verifiedCount = businesses.filter((business) => business.verified).length;

  function clearAppliedPromo() {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
  }

  function toggleFavorite(product) {
    const isSaved = favorites.some((item) => item.id === product.id);
    const updatedFavorites = isSaved
      ? favorites.filter((item) => item.id !== product.id)
      : [...favorites, product];
    setFavorites(updatedFavorites);
    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(updatedFavorites),
      );
    } catch {
      setNotice('Favorites could not be saved on this device.');
      return;
    }
    setNotice(
      isSaved
        ? `${product.title} removed from your saved items.`
        : `${product.title} saved to your favorites.`,
    );
  }

  function addToCart(product) {
    const existing = cart.find((item) => item.id === product.id);
    if (product.stock < 1) {
      setNotice('This listing is currently unavailable.');
      return;
    }
    if (existing && existing.qty >= product.stock) {
      setNotice('There are no more units available for this listing.');
      return;
    }
    clearAppliedPromo();
    setCart((currentCart) => {
      const currentItem = currentCart.find((item) => item.id === product.id);
      if (currentItem) {
        if (currentItem.qty >= product.stock) return currentCart;
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...currentCart, { ...product, qty: 1 }];
    });
    setNotice(`${product.title} added to your booking cart.`);
  }

  function changeQuantity(productId, amount) {
    clearAppliedPromo();
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== productId) return item;
          const qty = Math.min(item.qty + amount, item.stock);
          return { ...item, qty };
        })
        .filter((item) => item.qty > 0),
    );
  }

  function openDirectory() {
    setActiveBusiness(null);
    setActiveClub(null);
    setProducts([]);
    setIsFavoritesView(false);
  }

  function openFavorites() {
    setActiveBusiness(null);
    setActiveClub(null);
    setProducts([]);
    setIsFavoritesView(true);
  }

  function openBusiness(business) {
    setIsFavoritesView(false);
    setActiveBusiness(business);
  }

  async function applyPromoCode(event, providedCode) {
    event?.preventDefault();
    const code = (providedCode || promoCodeInput).trim().toUpperCase();
    if (!code) {
      setPromoError('Enter a promo code to apply it.');
      return;
    }
    if (cart.length === 0) {
      setPromoError('Add a listing to your cart before applying a code.');
      return;
    }

    setPromoError('');
    setValidatingPromo(true);
    try {
      const response = await fetch(`${API_BASE_URL}/promo-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          items: cart.map(({ id, qty }) => ({
            product_id: id,
            quantity: qty,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result.detail === 'string'
            ? result.detail
            : 'That promo code could not be applied.',
        );
      }
      setAppliedPromo(result);
      setPromoCodeInput(result.code);
      setPromoError('');
    } catch (error) {
      setAppliedPromo(null);
      setPromoError(error.message || 'That promo code could not be applied.');
    } finally {
      setValidatingPromo(false);
    }
  }

  async function submitOrder(event) {
    event.preventDefault();
    const email = checkoutEmail.trim();
    if (!PAU_EMAIL_PATTERN.test(email)) {
      setEmailError('Use your school email ending exactly in @pau.edu.ng.');
      return;
    }
    if (cart.length === 0) {
      setNotice('Your cart is empty.');
      return;
    }
    if (validatingPromo) {
      setNotice('Please wait while the promo code is being checked.');
      return;
    }

    setEmailError('');
    setSubmittingOrder(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pau_email: email,
          promo_code: appliedPromo?.code || null,
          items: cart.map(({ id, qty }) => ({
            product_id: id,
            quantity: qty,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result.detail === 'string'
            ? result.detail
            : 'We could not complete your booking.',
        );
      }
      setProducts((currentProducts) =>
        currentProducts.map((product) => {
          const booking = result.find((item) => item.product_id === product.id);
          return booking
            ? { ...product, stock: Math.max(0, product.stock - booking.quantity) }
            : product;
        }),
      );
      setCart([]);
      clearAppliedPromo();
      setOrderComplete(true);
      setNotice('');
    } catch (error) {
      setNotice(error.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  }

  return (
    <div className="page-shell min-h-screen text-slate-900">
      <header className="site-header sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3.5 sm:gap-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={openDirectory}
            className="flex items-center gap-2.5 text-left sm:gap-3"
            aria-label="PAU Connect home"
          >
            <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-2xl text-white sm:h-11 sm:w-11">
              <Store className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight text-slate-950">
                PAU<span className="text-indigo-600">connect</span>
              </span>
              <span className="hidden text-[11px] font-medium tracking-wide text-slate-500 sm:block">
                CAMPUS, CONNECTED
              </span>
            </span>
          </button>
          {!activeBusiness && !isFavoritesView && (
            <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-500 md:flex">
              <a href="#businesses" className="transition hover:text-indigo-700">Discover</a>
              <a href="#clubs" className="transition hover:text-indigo-700">Communities</a>
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                Made for PAU
              </span>
            </nav>
          )}
          <button
            type="button"
            onClick={isFavoritesView ? openDirectory : openFavorites}
            aria-label={`Favorites (${favorites.length})`}
            aria-pressed={isFavoritesView}
            className="favorite-trigger inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-2.5 py-2.5 text-sm font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 sm:px-3"
          >
            <Heart
              className="h-4 w-4"
              fill={isFavoritesView ? 'currentColor' : 'none'}
            />
            <span className="hidden sm:inline">
              {isFavoritesView ? 'Discover' : 'Favorites'}
            </span>
            <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-xs">
              {favorites.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOrderComplete(false);
              setIsCartOpen(true);
            }}
            className="cart-trigger inline-flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm font-bold text-white transition sm:gap-2.5 sm:px-4"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Booking cart</span>
            <span className="cart-count rounded-md px-1.5 py-0.5 text-xs">
              {itemCount}
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        {activeBusiness || isFavoritesView ? (
          <section>
            <button
              type="button"
              onClick={openDirectory}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-indigo-200 hover:text-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {isFavoritesView ? 'Back to marketplace' : 'All businesses'}
            </button>
            {activeBusiness && (
            <div className="market-hero relative isolate mb-8 overflow-hidden rounded-[2rem] p-7 text-white shadow-xl sm:p-10">
              <div className="hero-orb hero-orb-one" />
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <span className="hero-eyebrow mb-3 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
                    {activeBusiness.category} · {activeBusiness.tag}
                  </span>
                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                    {activeBusiness.org_name}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                    Browse this vendor’s campus offerings and add a product or
                    service to your booking cart.
                  </p>
                </div>
                {activeBusiness.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400/15 px-3 py-2 text-sm font-semibold text-emerald-100">
                    <BadgeCheck className="h-4 w-4" />
                    Verified business
                  </span>
                )}
              </div>
              {activeBusiness.handles && (
                <a
                  href={`mailto:${activeBusiness.handles}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-indigo-50 transition hover:bg-white/15"
                >
                  <Mail className="h-4 w-4 text-indigo-200" />
                  {activeBusiness.handles}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            )}

            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <span className="section-kicker">CURATED FOR CAMPUS</span>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                  {isFavoritesView ? 'Your saved finds' : 'Listings'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isFavoritesView
                    ? 'Your favorite products and services, all in one place.'
                    : `Products and services from ${activeBusiness.org_name}`}
                </p>
              </div>
              <span className="rounded-full border border-indigo-100 bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm">
                {activeBusiness ? products.length : favorites.length}{' '}
                {(activeBusiness ? products.length : favorites.length) === 1
                  ? 'listing'
                  : 'listings'}
              </span>
            </div>

            {activeBusiness && loadingProducts ? (
              <LoadingState label="Loading listings…" />
            ) : (activeBusiness ? products : favorites).length === 0 ? (
              <EmptyState
                icon={
                  isFavoritesView ? (
                    <Heart className="h-7 w-7" />
                  ) : (
                    <PackageCheck className="h-7 w-7" />
                  )
                }
                title={isFavoritesView ? 'No favorites saved yet' : 'No listings yet'}
                message={
                  isFavoritesView
                    ? 'Tap the heart on a listing to keep it close for later.'
                    : 'This business hasn’t added any products or services yet.'
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(activeBusiness ? products : favorites).map((product) => (
                  <article
                    key={product.id}
                    className="business-card overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="product-image-wrap relative">
                      <img
                        src={product.image}
                        alt={product.offering_details || product.title}
                        className="h-52 w-full bg-slate-100 object-cover transition duration-500 hover:scale-[1.025]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleFavorite(product)}
                        aria-label={
                          favorites.some((item) => item.id === product.id)
                            ? `Remove ${product.title} from favorites`
                            : `Add ${product.title} to favorites`
                        }
                        aria-pressed={favorites.some(
                          (item) => item.id === product.id,
                        )}
                        className="favorite-product-button absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white"
                      >
                        <Heart
                          className="h-5 w-5"
                          fill={
                            favorites.some((item) => item.id === product.id)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>
                      {isFavoritesView && product.seller && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                          {product.seller}
                        </span>
                      )}
                    </div>
                    <div className="space-y-4 p-5">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-600">
                          {product.category}
                        </span>
                        <h3 className="mt-1 text-lg font-bold">{product.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                          {product.offering_details || product.description}
                        </p>
                        {product.promo_details && (
                          <p className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold leading-5 text-emerald-800">
                            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {product.promo_details}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-base font-black tracking-tight text-slate-950">
                            {product.price_display || formatPrice(product.price)}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <PackageCheck className="h-3 w-3" />
                            {product.stock} available
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={product.stock < 1}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          {product.stock < 1 ? 'Unavailable' : 'Book'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-12">
            <div className="market-hero relative isolate overflow-hidden rounded-[2rem] px-6 py-9 text-white shadow-2xl sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div className="hero-orb hero-orb-one" />
              <div className="hero-orb hero-orb-two" />
              <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="max-w-2xl">
                  <span className="hero-eyebrow inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    TOP FINDS FOR PAU STUDENTS
                  </span>
                  <h1 className="mt-6 text-[2.65rem] font-black leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[4.25rem]">
                    Student life,
                    <br />
                    <span className="hero-heading-accent">well supplied.</span>
                  </h1>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-indigo-100 sm:text-base">
                    Shop student businesses, discover everyday campus services,
                    and find the people making PAU life better.
                  </p>
                  <label className="hero-search mt-7 flex max-w-xl items-center gap-3 rounded-2xl px-4 py-1 shadow-2xl">
                    <Search className="h-5 w-5 shrink-0 text-indigo-500" />
                    <input
                      type="search"
                      value={businessSearch}
                      onChange={(event) => setBusinessSearch(event.target.value)}
                      placeholder="What are you looking for?"
                      className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <span className="hidden shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 sm:block">
                      SEARCH
                    </span>
                  </label>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Fashion & beauty', 'Tech services', 'Daily essentials'].map(
                      (category) => (
                        <button
                          type="button"
                          key={category}
                          onClick={() => setBusinessSearch(category.split(' ')[0])}
                          className="hero-category-chip rounded-full px-3 py-1.5 text-xs font-semibold transition hover:bg-white/20"
                        >
                          {category}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href="#businesses"
                      className="hero-primary-action inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5"
                    >
                      Explore businesses <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={openFavorites}
                      className="hero-secondary-action inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:bg-white/15"
                    >
                      <Heart className="h-4 w-4" /> Saved items
                    </button>
                  </div>
                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-indigo-100">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      {verifiedCount} verified community listings
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-amber-300" />
                      Built around student life
                    </span>
                  </div>
                </div>

                <div
                  className="hero-showcase mt-6 h-48 sm:h-56 lg:mt-0 lg:h-[310px]"
                  aria-hidden="true"
                >
                  <div className="hero-photo-card">
                    <img
                      src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1000&amp;auto=format&amp;fit=crop&amp;q=85"
                      alt=""
                      className="h-full w-full rounded-[1.6rem] object-cover"
                    />
                    <div className="hero-photo-caption">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                        Campus directory
                      </span>
                      <span className="mt-1 block text-lg font-black text-white">
                        Made by your community
                      </span>
                    </div>
                    <span className="hero-photo-sticker">
                      <Sparkles className="h-4 w-4" />
                      Find your next favorite
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <section id="businesses" className="scroll-mt-28">
              <div className="section-heading mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="section-kicker">DISCOVER &amp; SUPPORT</span>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    Campus businesses
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Good finds from the people around you.
                  </p>
                </div>
                {!loadingBusinesses && (
                  <span className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm">
                    {filteredBusinesses.length} businesses
                  </span>
                )}
              </div>
            {loadingBusinesses ? (
              <LoadingState label="Loading campus businesses…" />
            ) : filteredBusinesses.length === 0 ? (
              <EmptyState
                icon={<Store className="h-7 w-7" />}
                title="No businesses found"
                message="Try another search or check back later."
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBusinesses.map((business) => {
                  const promo = promoCodes.find(
                    (item) => item.business_id === business.id,
                  );
                  return (
                  <button
                    type="button"
                    key={business.id}
                    onClick={() => openBusiness(business)}
                    className="business-card group overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                  >
                    <div className="business-card-cover relative flex h-36 items-end overflow-hidden bg-slate-200 p-5">
                      <img
                        src={getBusinessImage(business)}
                        alt={`${business.category} at ${business.org_name}`}
                        className="business-cover-image absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=85';
                        }}
                      />
                      <div className="business-cover-shade absolute inset-0" />
                      <span className="business-initials relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/40 bg-white/90 text-xl font-black text-slate-900 shadow-lg backdrop-blur">
                        {getInitials(business.org_name)}
                      </span>
                      {business.verified && (
                        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow-sm backdrop-blur">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black tracking-tight text-slate-950">
                            {business.org_name}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{business.category}</p>
                        </div>
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          {business.tag}
                        </span>
                        {promo ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <Tag className="h-3.5 w-3.5" />
                            {promo.discount_percent}% off
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-indigo-700">
                            Explore business
                          </span>
                        )}
                      </div>
                      {promo && (
                        <p className="mt-2 text-[11px] font-medium text-slate-500">
                          Use{' '}
                          <span className="font-bold tracking-wide text-emerald-700">
                            {promo.code}
                          </span>{' '}
                          at checkout
                        </p>
                      )}
                    </div>
                  </button>
                  );
                })}
              </div>
            )}

            </section>

            <section id="clubs" className="club-section scroll-mt-28 rounded-[1.8rem] p-5 sm:p-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="club-kicker">FIND YOUR PEOPLE</span>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Student Clubs <span className="text-violet-300">&amp;</span> Communities
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-violet-100/75">
                    Meet people who share your curiosity, creativity, and ambition.
                  </p>
                </div>
                {!loadingBusinesses && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-violet-100">
                    {filteredClubs.length} communities
                  </span>
                )}
              </div>
            {loadingBusinesses ? (
              <LoadingState label="Loading student clubs…" />
            ) : filteredClubs.length === 0 ? (
              <EmptyState
                icon={<BriefcaseBusiness className="h-7 w-7" />}
                title="No clubs found"
                message="Try a different search or check back later."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredClubs.map((club) => (
                  <button
                    type="button"
                    key={club.id}
                    onClick={() => setActiveClub(club)}
                    className="club-card group rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-white/[0.12]"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="club-avatar flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white">
                        {getInitials(club.org_name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-bold text-white">{club.org_name}</span>
                          {club.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-300" />}
                        </span>
                        <span className="mt-1 block truncate text-xs text-violet-100/60">{club.category}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-violet-200/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-200" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
          </section>
        )}
      </main>

      {notice && (
        <div
          role="status"
          className="notice-enter fixed bottom-5 left-4 right-4 z-40 mx-auto max-w-lg rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl sm:left-auto sm:right-5"
        >
          <div className="flex items-start justify-between gap-4">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
              className="shrink-0 text-slate-300 hover:text-white"
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {activeClub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setActiveClub(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="club-dialog-title"
            className="club-dialog w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <BriefcaseBusiness className="h-6 w-6" />
              </span>
              <button
                type="button"
                onClick={() => setActiveClub(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close club details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                {activeClub.tag}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  activeClub.verified
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {activeClub.verified ? 'Verified' : 'Not verified'}
              </span>
            </div>
            <h2 id="club-dialog-title" className="mt-3 text-2xl font-black">
              {activeClub.org_name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{activeClub.category}</p>
            <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">
              <div className="py-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" /> Meeting time
                  </span>
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {activeClub.meeting_time || 'To be announced'}
                </dd>
              </div>
              <div className="py-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Meeting location
                  </span>
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {activeClub.meeting_location || 'To be announced'}
                </dd>
              </div>
              <div className="py-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Contact
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-indigo-700">
                  {activeClub.handles || 'Contact details not provided'}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close booking cart"
            onClick={() => {
              setIsCartOpen(false);
              setOrderComplete(false);
            }}
            className="absolute inset-0 cursor-default"
          />
          <aside className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                  PAU Connect
                </p>
                <h2 className="text-xl font-black">
                  {orderComplete ? 'Booking confirmed' : 'Booking cart'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setOrderComplete(false);
                }}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close booking cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {orderComplete ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <BadgeCheck className="h-9 w-9" />
                </span>
                <h3 className="mt-5 text-2xl font-black">You’re booked!</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                  Your booking has been recorded. The business can follow up
                  using your PAU email address.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setOrderComplete(false);
                  }}
                  className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Continue exploring
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
                  {cart.length === 0 ? (
                    <div className="py-16 text-center">
                      <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                      <h3 className="mt-4 font-bold">Your cart is empty</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Browse a business and add a listing to start a booking.
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-2xl border border-slate-200 p-3"
                      >
                        <img
                          src={item.image}
                          alt=""
                          className="h-20 w-20 rounded-xl bg-slate-100 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-bold">{item.title}</h3>
                          <p className="mt-1 text-sm text-indigo-700">
                            {formatPrice(item.price)}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => changeQuantity(item.id, -1)}
                              disabled={validatingPromo || submittingOrder}
                              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Remove one ${item.title}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-4 text-center text-sm font-bold">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(item.id, 1)}
                              disabled={
                                item.qty >= item.stock ||
                                validatingPromo ||
                                submittingOrder
                              }
                              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
                              aria-label={`Add one ${item.title}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="shrink-0 pt-1 text-sm font-bold">
                          {formatPrice(item.price * item.qty)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <form
                  onSubmit={submitOrder}
                  className="space-y-3.5 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-7"
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between font-semibold text-emerald-700">
                        <span>
                          {appliedPromo.code} ({appliedPromo.discount_percent}%)
                        </span>
                        <span>−{formatPrice(promoDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-black text-slate-950">
                      <span>Order total</span>
                      <span>{formatPrice(checkoutTotal)}</span>
                    </div>
                  </div>
                  {cart.some((item) =>
                    /[-–—]/.test(item.price_display || ''),
                  ) && (
                    <p className="text-xs leading-5 text-slate-500">
                      This total uses the starting prices for listings with
                      price ranges. The business can confirm the final quote.
                    </p>
                  )}
                  <div className="rounded-2xl border border-indigo-100 bg-white p-3.5">
                    <label
                      htmlFor="promo-code"
                      className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"
                    >
                      <Tag className="h-4 w-4 text-indigo-600" />
                      Business promo code
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="promo-code"
                        type="text"
                        disabled={validatingPromo || submittingOrder}
                        value={promoCodeInput}
                        onChange={(event) => {
                          setPromoCodeInput(event.target.value.toUpperCase());
                          setPromoError('');
                          if (
                            appliedPromo &&
                            event.target.value.toUpperCase() !== appliedPromo.code
                          ) {
                            setAppliedPromo(null);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') applyPromoCode(event);
                        }}
                        placeholder="Enter code"
                        autoComplete="off"
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        aria-describedby={
                          promoError ? 'promo-error' : 'promo-help'
                        }
                      />
                      {appliedPromo ? (
                        <button
                          type="button"
                          onClick={clearAppliedPromo}
                          disabled={submittingOrder}
                          className="rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={applyPromoCode}
                          disabled={validatingPromo || cart.length === 0}
                          className="rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {validatingPromo ? 'Checking…' : 'Apply'}
                        </button>
                      )}
                    </div>
                    {promoError ? (
                      <p
                        id="promo-error"
                        className="mt-2 text-xs font-medium text-rose-600"
                        role="alert"
                      >
                        {promoError}
                      </p>
                    ) : appliedPromo ? (
                      <p
                        id="promo-help"
                        className="mt-2 text-xs leading-5 text-emerald-700"
                      >
                        {appliedPromo.discount_percent}% off eligible items from{' '}
                        {appliedPromo.business_name}.
                      </p>
                    ) : (
                      <p
                        id="promo-help"
                        className="mt-2 text-xs leading-5 text-slate-500"
                      >
                        Codes only discount products from their specific business.
                      </p>
                    )}
                    {!appliedPromo &&
                      promoCodes
                        .filter((promo) =>
                          cart.some(
                            (item) => item.business_id === promo.business_id,
                          ),
                        )
                        .map((promo) => (
                          <button
                            type="button"
                            key={promo.code}
                            onClick={() => applyPromoCode(undefined, promo.code)}
                            disabled={validatingPromo}
                            className="mr-2 mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Tag className="h-3 w-3" />
                            {promo.code} · {promo.discount_percent}% off
                          </button>
                        ))}
                  </div>
                  <label
                    htmlFor="pau-email"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    School email
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      id="pau-email"
                      type="email"
                      required
                      value={checkoutEmail}
                      onChange={(event) => {
                        setCheckoutEmail(event.target.value);
                        setEmailError('');
                      }}
                      placeholder="you@pau.edu.ng"
                      autoComplete="email"
                      className="min-w-0 flex-1 py-3 text-sm outline-none"
                      aria-describedby={emailError ? 'email-error' : undefined}
                    />
                  </div>
                  {emailError && (
                    <p id="email-error" className="text-xs font-medium text-rose-600">
                      {emailError}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Only addresses ending exactly in @pau.edu.ng are accepted.
                  </p>
                  <button
                    type="submit"
                    disabled={
                      cart.length === 0 || submittingOrder || validatingPromo
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {submittingOrder ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Confirming booking…
                      </>
                    ) : (
                      <>Confirm booking · {formatPrice(checkoutTotal)}</>
                    )}
                  </button>
                </form>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function LoadingState({ label }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-500">
      <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" />
      {label}
    </div>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {icon}
      </span>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
}
