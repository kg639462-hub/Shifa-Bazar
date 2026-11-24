import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const primaryImage =
    (product.images && product.images[0]) || '/originallogo.png';

  // Calculate prices and discount
  const sellingPrice = Number(product.price) || 0;
  const originalPrice =
    product.original_price && Number(product.original_price) > sellingPrice
      ? Number(product.original_price)
      : Math.round(sellingPrice * 1.25);

  const discountPercent =
    product.discount_percent !== undefined && product.discount_percent !== null
      ? Number(product.discount_percent)
      : originalPrice > sellingPrice
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : 0;

  // Format prices in Indian Rupees (₹)
  const formattedPrice = sellingPrice.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedOriginalPrice = originalPrice.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const savingsAmount = originalPrice > sellingPrice ? (originalPrice - sellingPrice).toFixed(0) : 0;

  return (
    <div className="group bg-white rounded-2xl border border-[#d6e8dd] p-3 sm:p-4 hover:border-emerald-600/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* Normal Proportional Image Box */}
      <Link
        to={`/product/${product.id}`}
        className="relative block w-full h-48 sm:h-52 md:h-56 rounded-xl overflow-hidden bg-[#f4faf6]"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Subtle Extract Type / Pack Size Badge */}
        {product.extract_type && (
          <span className="absolute top-2.5 left-2.5 bg-white/95 text-[10px] font-sans font-bold tracking-wide text-[#0a2e1e] px-2 py-0.5 rounded-full border border-[#d6e8dd] shadow-2xs">
            {product.extract_type}
          </span>
        )}

        {/* Eye-Catching Red Discount Badge on Top Right */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-[10px] font-sans font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
            {discountPercent}% OFF
          </span>
        )}

        {/* Quick In-Stock Tag */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-semibold text-emerald-800 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>In Stock</span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="pt-3 px-1 flex flex-col justify-between flex-grow space-y-2.5">
        <div>
          {/* Category Pill */}
          {product.category && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm inline-block mb-1">
              {product.category}
            </span>
          )}

          <Link to={`/product/${product.id}`} className="block group-hover:text-emerald-900 transition-colors">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#0a2e1e] leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.short_desc ? (
            <p className="text-xs text-[#4b6356] line-clamp-1 mt-0.5">
              {product.short_desc}
            </p>
          ) : product.scientific_name ? (
            <p className="font-serif italic text-xs text-[#4b6356] line-clamp-1 mt-0.5">
              {product.scientific_name}
            </p>
          ) : null}
        </div>

        {/* Footer: Price in Rupees (₹) with Discount & Add Button */}
        <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-[#f0f5f2]">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {/* Selling Price */}
              <div className="font-sans text-lg sm:text-xl font-bold text-[#0a2e1e] tracking-tight flex items-baseline">
                <span className="mr-0.5 text-base font-semibold">₹</span>
                <span>{formattedPrice}</span>
              </div>

              {/* Strikethrough Original MRP */}
              {originalPrice > sellingPrice && (
                <span className="font-sans text-xs text-gray-400 line-through">
                  ₹{formattedOriginalPrice}
                </span>
              )}
            </div>

            {/* Savings Callout */}
            {savingsAmount > 0 && (
              <span className="text-[10px] font-semibold text-emerald-800">
                Save ₹{savingsAmount} ({discountPercent}% OFF)
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all duration-200 font-sans font-bold text-xs shadow-xs shrink-0 active:scale-95 ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-[#0a2e1e] hover:bg-emerald-900 text-white'
            }`}
            title={`Add ${product.name} to cart`}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
