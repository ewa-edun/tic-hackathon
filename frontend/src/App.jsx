import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
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
  Users,
  X,
} from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api';
const PAU_EMAIL_PATTERN = /^[^\s@]+@pau\.edu\.ng$/;
const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);

function getBusinessTheme(business) {
  const category = business.category.toLowerCase();
  if (category.includes('tech')) return 'from-sky-500 via-indigo-500 to-violet-600';
  if (category.includes('daily')) return 'from-amber-400 via-orange-500 to-rose-500';
  if (category.includes('academic')) return 'from-emerald-400 via-teal-500 to-cyan-600';
  return 'from-fuchsia-500 via-rose-500 to-orange-400';
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

export default function App() {
  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [activeClub, setActiveClub] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [businessSearch, setBusinessSearch] = useState('');
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [emailError, setEmailError] = useState('');
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
  const verifiedCount = businesses.filter((business) => business.verified).length;

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

    setEmailError('');
    setSubmittingOrder(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pau_email: email,
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={openDirectory}
            className="flex items-center gap-3 text-left"
            aria-label="PAU Connect home"
          >
            <span className="brand-mark flex h-11 w-11 items-center justify-center rounded-2xl text-white">
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
          {!activeBusiness && (
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
            onClick={() => {
              setOrderComplete(false);
              setIsCartOpen(true);
            }}
            className="cart-trigger inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white transition sm:px-4"
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
        {activeBusiness ? (
          <section>
            <button
              type="button"
              onClick={openDirectory}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-indigo-200 hover:text-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              All businesses
            </button>
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

            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <span className="section-kicker">CURATED FOR CAMPUS</span>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Listings</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Products and services from {activeBusiness.org_name}
                </p>
              </div>
              <span className="rounded-full border border-indigo-100 bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm">
                {products.length} {products.length === 1 ? 'listing' : 'listings'}
              </span>
            </div>

            {loadingProducts ? (
              <LoadingState label="Loading listings…" />
            ) : products.length === 0 ? (
              <EmptyState
                icon={<PackageCheck className="h-7 w-7" />}
                title="No listings yet"
                message="This business hasn’t added any products or services yet."
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="business-card overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-52 w-full bg-slate-100 object-cover transition duration-500 hover:scale-[1.025]"
                    />
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
                    THE PAU COMMUNITY, IN ONE PLACE
                  </span>
                  <h1 className="mt-6 text-[2.65rem] font-black leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[4.25rem]">
                    Campus life,
                    <br />
                    <span className="hero-heading-accent">well connected.</span>
                  </h1>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-indigo-100 sm:text-base">
                    Find student businesses, useful services, and the people
                    making things happen around PAU.
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

                <div className="hero-showcase hidden lg:block" aria-hidden="true">
                  <div className="showcase-glow" />
                  <div className="showcase-card showcase-card-back">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <BriefcaseBusiness className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="block text-xs font-bold text-slate-900">Campus finds</span>
                        <span className="text-[10px] text-slate-500">Made by your community</span>
                      </div>
                    </div>
                    <div className="showcase-mini-row mt-4">
                      <span className="mini-dot bg-rose-400" />
                      <span className="mini-dot bg-violet-400" />
                      <span className="mini-dot bg-emerald-400" />
                      <span className="mini-dot bg-amber-400" />
                      <span className="ml-1 text-[10px] font-semibold text-slate-500">and so much more</span>
                    </div>
                  </div>
                  <div className="showcase-card showcase-card-front">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Featured community</span>
                      <BadgeCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white">T</span>
                      <div>
                        <span className="block text-sm font-black text-slate-900">TIC Community</span>
                        <span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin className="h-3 w-3" /> Pan-Atlantic University
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-indigo-50 px-3 py-2.5">
                      <span className="text-[10px] font-semibold text-indigo-700">Explore campus life</span>
                      <ArrowUpRight className="h-4 w-4 text-indigo-700" />
                    </div>
                  </div>
                  <div className="showcase-sticker">
                    <Sparkles className="h-4 w-4" />
                    <span>Find your people</span>
                  </div>
                </div>
              </div>
            </div>

            <section id="businesses" className="scroll-mt-28">
              <div className="section-heading mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="section-kicker">DISCOVER & SUPPORT</span>
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
                {filteredBusinesses.map((business) => (
                  <button
                    type="button"
                    key={business.id}
                    onClick={() => setActiveBusiness(business)}
                    className="business-card group overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                  >
                    <div className={`business-card-cover relative flex h-32 items-end overflow-hidden bg-gradient-to-br ${getBusinessTheme(business)} p-5`}>
                      <div className="business-cover-pattern" />
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
                        <span className="text-xs font-bold text-indigo-700">
                          Explore business
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
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
                              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50"
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
                              disabled={item.qty >= item.stock}
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
                  className="space-y-4 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-7"
                >
                  <div className="flex justify-between text-base font-black">
                    <span>Order total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  {cart.some((item) =>
                    /[-–—]/.test(item.price_display || ''),
                  ) && (
                    <p className="text-xs leading-5 text-slate-500">
                      This total uses the starting prices for listings with
                      price ranges. The business can confirm the final quote.
                    </p>
                  )}
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
                    disabled={cart.length === 0 || submittingOrder}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {submittingOrder ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Confirming booking…
                      </>
                    ) : (
                      <>Confirm booking · {formatPrice(cartTotal)}</>
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
