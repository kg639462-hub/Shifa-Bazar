import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Check,
  Package,
} from 'lucide-react';
import { uploadProductImage } from '../../api/admin';

export default function ProductFormModal({ isOpen, onClose, onSave, editingProduct }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Syrup');
  const [packSize, setPackSize] = useState('100 ml');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState(100);
  const [shortDesc, setShortDesc] = useState('');
  const [images, setImages] = useState([]); // Zero prefilled dummy images

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlBox, setShowUrlBox] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setCategory(editingProduct.category || 'Syrup');
      setPackSize(editingProduct.extract_type || '');
      setPrice(editingProduct.price !== undefined ? editingProduct.price : '');
      setOriginalPrice(editingProduct.original_price || '');
      setStock(editingProduct.stock !== undefined ? editingProduct.stock : 100);
      setShortDesc(editingProduct.short_desc || editingProduct.full_desc || '');
      // Only keep genuine valid image URLs from editingProduct
      const validImages = Array.isArray(editingProduct.images)
        ? editingProduct.images.filter((img) => img && typeof img === 'string' && img.trim().length > 0)
        : [];
      setImages(validImages);
    } else {
      // Clean slate for new product - zero fake images
      setName('');
      setCategory('Syrup');
      setPackSize('100 ml');
      setPrice('');
      setOriginalPrice('');
      setStock(100);
      setShortDesc('');
      setImages([]);
    }
    setError(null);
    setUrlInput('');
    setShowUrlBox(false);
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  // Handle uploading photos from device / laptop
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    setError(null);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const uploadedUrl = await uploadProductImage(file);
        if (uploadedUrl) {
          uploadedUrls.push(uploadedUrl);
        }
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(`Failed to upload photo: ${err.message}`);
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  // Add photo via web URL
  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    setShowUrlBox(false);
  };

  // Remove a specific photo
  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Quick chips for pack size / volume
  const getQuickChips = () => {
    if (category.toLowerCase().includes('syrup') || category.toLowerCase().includes('drop')) {
      return ['60 ml', '100 ml', '200 ml', '450 ml', '500 ml'];
    }
    if (category.toLowerCase().includes('tablet') || category.toLowerCase().includes('capsule')) {
      return ['10 Tablets', '15 Tablets', '30 Tablets', '60 Capsules', '100 Tablets'];
    }
    return ['50 g', '100 g', '200 g', '1 Unit', '1 Strip'];
  };

  const handleChipClick = (chipVal) => {
    setPackSize(chipVal);
  };

  // Auto calculate discount
  const numPrice = parseFloat(price) || 0;
  const numOriginalPrice = parseFloat(originalPrice) || 0;
  const discountPercent =
    numOriginalPrice > numPrice && numPrice > 0
      ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100)
      : 0;
  const savingsAmount = numOriginalPrice > numPrice ? (numOriginalPrice - numPrice).toFixed(2) : 0;

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter the product name.');
      return;
    }

    if (!price || Number(price) <= 0) {
      setError('Please enter a valid selling price in Rupees (₹).');
      return;
    }

    setLoading(true);

    try {
      // Build clean payload without any fake images
      const payload = {
        name: name.trim(),
        category: category.trim(),
        extract_type: packSize.trim() || (category === 'Syrup' ? '100 ml' : '10 Tablets Strip'),
        price: Number(price),
        original_price: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.25),
        stock: parseInt(stock, 10) || 100,
        short_desc: shortDesc.trim() || `${name.trim()} - Genuine healthcare preparation.`,
        full_desc: shortDesc.trim() || `${name.trim()} - Genuine healthcare preparation.`,
        scientific_name: `${name.trim()} Standardized Formulation`,
        dosage: 'As recommended by healthcare advisor or as on pack.',
        ingredients: ['Active Ingredients'],
        // STRICTLY only genuine images uploaded by admin (no forced 4, no dummy Unsplash)
        images: images.filter((img) => img && img.trim().length > 0),
      };

      await onSave(payload, editingProduct?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl border border-[#d6e8dd] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0a2e1e] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-bold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-[#a3e6be]">
              {editingProduct ? `Updating ${editingProduct.name}` : 'Upload product details, pricing, and pictures'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Product Name */}
          <div>
            <label className="block text-xs font-bold text-[#0a2e1e] mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kiddi-66 Syrup / Crocin Advance / Pain Balm"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#cbd5e1] rounded-xl focus:ring-2 focus:ring-[#0a2e1e] focus:outline-hidden bg-[#fafcfb]"
            />
          </div>

          {/* 2. Category & Pack Size (Syrup ml / Tablets Count) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#0a2e1e] mb-1">
                Product Type / Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  if (newCat === 'Syrup') setPackSize('100 ml');
                  else if (newCat === 'Tablets') setPackSize('10 Tablets');
                  else if (newCat === 'Capsules') setPackSize('30 Capsules');
                }}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#cbd5e1] rounded-xl focus:ring-2 focus:ring-[#0a2e1e] focus:outline-hidden bg-white"
              >
                <option value="Syrup">Syrup / Liquid</option>
                <option value="Tablets">Tablets</option>
                <option value="Capsules">Capsules</option>
                <option value="Drops">Drops</option>
                <option value="Ointment">Ointment / Gel / Cream</option>
                <option value="Powder">Powder / Churna</option>
                <option value="Wellness">Healthcare / Wellness</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0a2e1e] mb-1">
                {category === 'Syrup' || category === 'Drops'
                  ? 'Syrup Volume (ml) *'
                  : category === 'Tablets' || category === 'Capsules'
                  ? 'Tablets / Count *'
                  : 'Packaging / Pack Size *'}
              </label>
              <input
                type="text"
                required
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder={
                  category === 'Syrup'
                    ? 'e.g. 100 ml, 200 ml'
                    : category === 'Tablets'
                    ? 'e.g. 10 Tablets, 15 Tablets'
                    : 'e.g. 50g, 1 Pack'
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#cbd5e1] rounded-xl focus:ring-2 focus:ring-[#0a2e1e] focus:outline-hidden bg-[#fafcfb]"
              />
            </div>
          </div>

          {/* Quick Pack Size Selection Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-gray-500 font-medium">Quick Select:</span>
            {getQuickChips().map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                  packSize === chip
                    ? 'bg-[#0a2e1e] text-white border-[#0a2e1e] font-semibold'
                    : 'bg-[#f0faf4] text-[#0a2e1e] border-[#d6e8dd] hover:bg-emerald-100'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* 3. Pricing & Stock */}
          <div className="p-3.5 bg-[#f0faf4] rounded-2xl border border-[#d6e8dd] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0a2e1e] mb-1">
                  Selling Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="150"
                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-bold border border-[#cbd5e1] rounded-xl focus:ring-2 focus:ring-[#0a2e1e] focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0a2e1e] mb-1">
                  M.R.P. (₹) <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="188"
                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm border border-[#cbd5e1] rounded-xl focus:ring-2 focus:ring-[#0a2e1e] focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0a2e1e] mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#cbd5e1] rounded-xl focus:ring-2 focus:ring-[#0a2e1e] focus:outline-hidden bg-white"
                />
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-100/70 p-2 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  Customer saves ₹{savingsAmount} ({discountPercent}% OFF badge will be displayed)
                </span>
              </div>
            )}
          </div>

          {/* 4. Short Description */}
          <div>
            <label className="block text-xs font-bold text-[#0a2e1e] mb-1">
              Short Description / Product Details
            </label>
            <textarea
              rows="2"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="e.g. Effective herbal syrup for cough relief, fast-acting digestive tonic, safe for all ages..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#cbd5e1] rounded-xl focus:ring-2 focus:ring-[#0a2e1e] focus:outline-hidden bg-[#fafcfb]"
            />
          </div>

          {/* 5. Product Pictures (Flexible count, zero auto-injected photos) */}
          <div className="pt-2 border-t border-[#e2ece5] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-[#0a2e1e]">
                  Product Pictures
                </label>
                <p className="text-[11px] text-gray-500">
                  Upload 1, 2, or as many photos as you want (not forced to 4).
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {images.length} {images.length === 1 ? 'Photo' : 'Photos'}
              </span>
            </div>

            {/* Photos Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#d6e8dd] bg-white group shadow-2xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Product photo ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                    />

                    {/* Cover Photo Badge on first image */}
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-[#0a2e1e] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        Cover
                      </span>
                    )}

                    {/* Delete Photo Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-transform active:scale-90"
                      title="Delete this photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <label className="inline-flex items-center gap-2 bg-[#0a2e1e] hover:bg-[#072417] text-white px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-xs">
                {uploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                ) : (
                  <Upload className="w-4 h-4 text-emerald-300" />
                )}
                <span>{images.length === 0 ? 'Upload Photos from Device' : '+ Add More Photos'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {!showUrlBox ? (
                <button
                  type="button"
                  onClick={() => setShowUrlBox(true)}
                  className="text-xs text-[#0a2e1e] hover:underline font-semibold px-2 py-1"
                >
                  or paste image link
                </button>
              ) : (
                <div className="flex items-center gap-1.5 w-full sm:w-auto mt-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://...image.jpg"
                    className="px-3 py-1.5 text-xs border border-[#cbd5e1] rounded-lg focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-800"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUrlBox(false);
                      setUrlInput('');
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#e2ece5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="bg-[#0a2e1e] hover:bg-[#072417] text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-300" /> : <Check className="w-4 h-4 text-emerald-300" />}
              <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
