import React, { useEffect, useState, useMemo } from 'react';
import {
  Leaf,
  Sparkles,
  ShieldCheck,
  Search,
  X,
  Truck,
  HeartPulse,
  Star,
  Award,
  MessageCircle,
  CheckCircle2,
  Filter,
  ArrowRight,
  Pill,
  Clock,
  Percent,
} from 'lucide-react';
import { getProducts } from '../api/products';
import ProductCard from '../components/catalog/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadDispensaryProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDispensaryProducts();
  }, []);

  // Filter categories dynamically
  const categories = useMemo(() => {
    const cats = ['All'];
    products.forEach((p) => {
      if (p.category && !cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    return cats;
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        p.name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.short_desc?.toLowerCase().includes(query) ||
        p.extract_type?.toLowerCase().includes(query) ||
        p.scientific_name?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* ========================================================================= */}
      {/* 1. HIGH-IMPACT HERO BANNER WITH LIVE SEARCH & TRUST PILLARS              */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#051c11] via-[#093522] to-[#03150d] text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/60 shadow-xl">
        {/* Soft Ambient Herbal Glow Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-[1440px] 2xl:max-w-[1536px] mx-auto space-y-8">
          {/* Top Pill Tag */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3.5 py-1 rounded-full border border-emerald-400/30 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>India's Trusted Online Medicine & Healthcare Store</span>
            </span>
            <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
              ⚡ Health Bhi... Savings Bhi...
            </span>
          </div>

          {/* Headline & Description */}
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Genuine Medicines, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
                Better Health & Everyday Savings
              </span>
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
              Order authentic syrups, tablets, health tonics, and daily healthcare remedies directly from certified dispensaries with tamper-proof packaging and express delivery across India.
            </p>
          </div>

          {/* Interactive Live Search Bar */}
          <div className="max-w-2xl relative">
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-1.5 border-2 border-emerald-400/40 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-400/20 transition-all duration-200">
              <Search className="w-5 h-5 text-emerald-700 ml-3.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines, syrups, tablets, health tonics..."
                className="w-full px-3 py-2 text-sm sm:text-base text-[#0a2e1e] placeholder-gray-400 bg-transparent focus:outline-hidden font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full transition-colors mr-1"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                className="bg-[#0a2e1e] hover:bg-emerald-950 text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
              >
                <span>Find</span>
              </button>
            </div>

            {/* Quick Search Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-emerald-200/90">
              <span className="font-semibold text-emerald-300">Popular:</span>
              {['Syrup', 'Health Tonic', 'Tablets', 'Capsules', 'Drops'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="bg-emerald-900/50 hover:bg-emerald-800 text-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-700/50 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Feature Pillars Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-emerald-800/60">
            <div className="bg-white/5 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white">100% Genuine</h2>
                <p className="text-[11px] text-emerald-200/70">Lab & Batch Verified</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white">Free Delivery</h2>
                <p className="text-[11px] text-emerald-200/70">Delivery also free</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white">Up to 25% OFF</h2>
                <p className="text-[11px] text-emerald-200/70">Health Bhi... Savings Bhi</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white">WhatsApp Order</h2>
                <p className="text-[11px] text-emerald-200/70">+91 8899903777</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROMOTIONAL SAVINGS DEAL BANNER                                        */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-[#0a2e1e] rounded-3xl p-5 sm:p-7 text-white shadow-lg border border-emerald-600/30 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="bg-amber-400 text-emerald-950 text-[10px] sm:text-xs font-extrabold uppercase px-3 py-1 rounded-full inline-block tracking-wider">
              Special Savings Deal
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
              Flat 20% OFF on Ash-Shifa Health Tonics & Remedies
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Enjoy verified potent herbal compounds directly bottled at source. Guaranteed purity and lowest prices for your family's daily vitality.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/918899903777?text=Hello%20Shifa%20Bazar,%20I%20want%20to%20order%20the%20Health%20Tonic%20offer"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-emerald-50 text-[#0a2e1e] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>Order via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CATEGORY FILTER TABS & PRODUCT CATALOG GRID                            */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#d6e8dd]">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0a2e1e] tracking-tight">
              Featured Medicines & Formulations
            </h2>
            <p className="text-xs sm:text-sm text-[#4b6356]">
              {filteredProducts.length} verified products ready for doorstep delivery
            </p>
          </div>

          {/* Interactive Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#0a2e1e] text-white shadow-sm'
                      : 'bg-white text-[#0a2e1e] border border-[#d6e8dd] hover:bg-[#e2ece5]'
                  }`}
                >
                  {cat === 'All' ? '🌟 All Medicines' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Pill indicator if search is active */}
        {(searchQuery || selectedCategory !== 'All') && (
          <div className="flex items-center gap-2 text-xs text-[#0a2e1e] bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
            <span className="font-semibold">Active Filter:</span>
            {searchQuery && (
              <span className="bg-white px-2 py-0.5 rounded-md border border-emerald-300 font-bold">
                "{searchQuery}"
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="bg-white px-2 py-0.5 rounded-md border border-emerald-300 font-bold">
                Category: {selectedCategory}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="ml-auto text-emerald-800 hover:text-emerald-950 font-bold underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Product Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-[#e2ece5] animate-pulse space-y-3">
                <div className="w-full h-48 sm:h-52 md:h-56 bg-gray-200 rounded-xl"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 pt-2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#d6e8dd] shadow-sm max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0a2e1e]">
              No Remedies Found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              We couldn't find any medicine matching "{searchQuery}". Try searching for another name or reset filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="bg-[#0a2e1e] text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-emerald-900 transition-colors"
            >
              View All Medicines
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. WHY CHOOSE SHIFA BAZAR? (TRUST & PURITY PILLARS)                       */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-emerald-800 text-xs font-bold uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
            The Shifa Standard
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0a2e1e]">
            Why Thousands of Families Trust Shifa Bazar
          </h2>
          <p className="text-xs sm:text-sm text-[#4b6356]">
            We bridge authentic botanical pharmacopeia formulations with modern certified laboratory standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#d6e8dd] shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0a2e1e]">
              100% Monograph Verified
            </h3>
            <p className="text-xs text-[#4b6356] leading-relaxed">
              Every preparation is certified against standard clinical pharmacopoeia specifications with verified botanical potency and zero harmful adulterants.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#d6e8dd] shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0a2e1e]">
              Tamper-Proof Amber Packaging
            </h3>
            <p className="text-xs text-[#4b6356] leading-relaxed">
              Bottled in light-blocking pharmaceutical grade glass or sealed bottles to preserve delicate active bio-markers from thermal and solar degradation.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#d6e8dd] shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0a2e1e]">
              Direct Express Dispatch
            </h3>
            <p className="text-xs text-[#4b6356] leading-relaxed">
              Fast door-to-door transit across India. Orders are dispatched directly from our verified dispensary stocks within 24 to 48 hours.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PATIENT TESTIMONIALS & VERIFIED REVIEWS                                */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-[#f4faf6] to-white py-12 px-4 sm:px-6 lg:px-8 border-y border-[#d6e8dd]">
        <div className="w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
              Customer Feedback
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0a2e1e]">
              Real Words from Happy Patients
            </h2>
            <p className="text-xs sm:text-sm text-[#4b6356]">
              Verified buyers who experienced genuine relief and honest dispensary pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#d6e8dd] shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-[#4b6356] italic leading-relaxed">
                "Got my Ash-Shifa Health Tonic in just 2 days. The packaging was very secure and original. The quality is noticeably better than standard market tonics."
              </p>
              <div className="pt-2 border-t border-[#f0f5f2] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0a2e1e]">Rajesh Sharma</h3>
                  <span className="text-[10px] text-gray-500">Lucknow, UP</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  ✓ Verified Buyer
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#d6e8dd] shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-[#4b6356] italic leading-relaxed">
                "Ordering through the website was super smooth, and having WhatsApp support right there gave me full confidence. The pricing is also much more honest."
              </p>
              <div className="pt-2 border-t border-[#f0f5f2] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0a2e1e]">Imran Khan</h3>
                  <span className="text-[10px] text-gray-500">Kanpur, UP</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  ✓ Verified Buyer
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#d6e8dd] shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-[#4b6356] italic leading-relaxed">
                "Health Bhi... Savings Bhi is really true. I saved ₹76 on two bottles. Genuine medicines delivered directly to home. Will definitely order regularly."
              </p>
              <div className="pt-2 border-t border-[#f0f5f2] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0a2e1e]">Sunita Verma</h3>
                  <span className="text-[10px] text-gray-500">New Delhi</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  ✓ Verified Buyer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. DISPENSARY CERTIFICATION BANNER                                        */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#d6e8dd] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Prescription Pharmacopeia Standards</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0a2e1e]">
              Handcrafted with Active Botanical Integrity
            </h2>
            <p className="text-xs sm:text-sm text-[#4b6356] max-w-xl">
              All formulations are standardized to bioactive marker compounds, sealed in amber miron glass, and kept cold until clinical courier dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#f0faf4] border border-[#d6e8dd] rounded-xl px-4 py-3 text-center">
              <ShieldCheck className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-[#0a2e1e] block">100% Monograph</span>
              <span className="text-[9px] text-[#4b6356]">Lab Verified</span>
            </div>
            <div className="bg-[#f0faf4] border border-[#d6e8dd] rounded-xl px-4 py-3 text-center">
              <Leaf className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-[#0a2e1e] block">Cold-Pack</span>
              <span className="text-[9px] text-[#4b6356]">Free Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
