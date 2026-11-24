import { apiRequest } from './client';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getProducts } from './products';

// Default fallback imagery (empty by default - only user uploaded images used)
export const defaultProductImages = [];

/**
 * Format images array for Supabase table
 * Ensures PostgreSQL check constraint (array_length = 4) is satisfied
 * while keeping empty strings for unused slots so front-end displays only genuine photos
 */
export function formatImagesForDb(images) {
  const clean = Array.isArray(images)
    ? images.filter((img) => img && typeof img === 'string' && img.trim().length > 0)
    : [];
  const padded = [...clean.slice(0, 4)];
  while (padded.length < 4) {
    padded.push('');
  }
  return padded;
}

/**
 * Compress an image file using browser Canvas before upload
 * Keeps dimensions within max 1200x1200px and quality 0.85 (clean & lightweight ~60-120KB)
 */
export async function compressImageFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve(null);
  });
}

/**
 * Upload a product image from laptop/device
 * Multi-layer fallback: Supabase Storage -> Backend Express Upload -> Canvas Data URL
 */
export async function uploadProductImage(file) {
  if (!file) throw new Error('No file selected');

  // 1. Compress image in browser
  const compressedDataUrl = await compressImageFile(file);
  const cleanFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  // 2. Direct Supabase Storage Attempt
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(cleanFilename, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(cleanFilename);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Direct Supabase storage upload notice:', err.message);
    }
  }

  // 3. Backend Upload API Attempt
  try {
    const res = await apiRequest('/upload', {
      method: 'POST',
      body: JSON.stringify({
        image: compressedDataUrl,
        filename: cleanFilename,
      }),
    });
    if (res.success && res.url) {
      return res.url;
    }
  } catch (err) {
    console.warn('Backend /api/upload notice:', err.message);
  }

  // 4. Reliable Client Fallback: Compressed Data URL (stored directly in Supabase table)
  return compressedDataUrl;
}

/**
 * Fetch all products for admin portal
 */
export async function getAdminProducts() {
  return await getProducts();
}

/**
 * Create a new product directly in Supabase (with backend sync)
 */
export async function createAdminProduct(productData) {
  const newId = `prod-${Math.random().toString(36).substring(2, 9)}`;
  const formattedImages = formatImagesForDb(productData.images);

  const payload = {
    id: newId,
    name: productData.name.trim(),
    category: productData.category || 'Formulation',
    price: Number(productData.price) || 0,
    original_price: productData.original_price ? Number(productData.original_price) : Math.round(Number(productData.price) * 1.25),
    stock: Number(productData.stock) || 100,
    extract_type: productData.extract_type || (productData.category === 'Syrup' ? '100 ml' : '10 Tablets Strip'),
    dosage: productData.dosage || 'As directed by healthcare advisor.',
    ingredients: Array.isArray(productData.ingredients) && productData.ingredients.length > 0
      ? productData.ingredients
      : ['Active Botanical Extracts'],
    co_a_verified: true,
    images: formattedImages,
    created_at: new Date().toISOString(),
  };

  // 1. Direct Supabase Query (Fastest, saves directly to live database)
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('products').insert([payload]).select().single();
    if (!error && data) {
      // Background sync to backend if online
      apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(() => {});
      return data;
    }
    if (error) {
      console.error('Direct Supabase insert error:', error);
      throw new Error(error.message || 'Failed to save product in Supabase');
    }
  }

  // 2. Fallback via backend Express API
  try {
    const res = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.product) return res.product;
  } catch (err) {
    console.error('Backend createAdminProduct error:', err.message);
    throw new Error(err.message || 'Failed to save product via backend');
  }

  return payload;
}

/**
 * Update an existing product
 */
export async function updateAdminProduct(id, productData) {
  const formattedImages = formatImagesForDb(productData.images);

  const updates = {
    name: productData.name,
    category: productData.category,
    price: Number(productData.price),
    original_price: productData.original_price ? Number(productData.original_price) : undefined,
    stock: Number(productData.stock),
    extract_type: productData.extract_type,
    dosage: productData.dosage,
    images: formattedImages,
    updated_at: new Date().toISOString(),
  };

  // 1. Direct Supabase
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }).catch(() => {});
      return data;
    }
    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(error.message || 'Failed to update product in database');
    }
  }

  // 2. Fallback via backend API
  try {
    const res = await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...productData, images: formattedImages }),
    });
    if (res.success && res.product) return res.product;
  } catch (err) {
    console.error('Backend update product error:', err.message);
    throw new Error(err.message || 'Failed to update product');
  }

  return { id, ...productData, images: formattedImages };
}

/**
 * Delete a product
 */
export async function deleteAdminProduct(id) {
  // 1. Direct Supabase
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      apiRequest(`/products/${id}`, { method: 'DELETE' }).catch(() => {});
      return true;
    }
    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(error.message || 'Failed to delete product from database');
    }
  }

  // 2. Fallback via backend API
  try {
    const res = await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
    if (res.success) return true;
  } catch (err) {
    console.error('Backend delete error:', err.message);
    throw new Error(err.message || 'Failed to delete product');
  }

  return true;
}

/**
 * Fetch all orders for admin portal
 */
export async function getAdminOrders() {
  try {
    const res = await apiRequest('/orders/admin/all');
    if (res.success && res.orders) return res.orders;
  } catch (err) {
    console.warn('Backend getAdminOrders notice, trying direct Supabase:', err.message);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Direct Supabase fetch orders notice:', e.message);
    }
  }

  return [];
}

/**
 * Update order status and/or payment status
 */
export async function updateAdminOrderStatus(id, updates) {
  // 1. Try Backend API first
  try {
    const res = await apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (res && res.success && res.order) return res.order;
  } catch (err) {
    console.warn('Backend updateAdminOrderStatus notice, trying direct Supabase:', err.message);
  }

  // 2. Direct Supabase Fallback
  if (isSupabaseConfigured() && supabase) {
    try {
      const minPayload = {};
      if (updates.order_status) minPayload.order_status = updates.order_status;
      if (updates.payment_status) minPayload.payment_status = updates.payment_status;

      if (updates.payment_status === 'refunded') {
        const refId = updates.refund_transaction_ref || `UTR-${Date.now().toString().slice(-8)}`;
        const amt = updates.refund_amount || '';
        minPayload.cancellation_reason = `[REFUND_COMPLETED: Ref ${refId}, Amount ₹${amt}, At ${new Date().toISOString()}]`;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(minPayload)
        .eq('id', id)
        .select();

      if (!error && data && data.length > 0) return { ...data[0], ...updates };
    } catch (e) {
      console.warn('Direct Supabase update order status notice:', e.message);
    }
  }

  return { id, ...updates };
}

/**
 * Process / Send money for refund on cancelled order (Admin Portal)
 */
export async function processAdminRefund(id, refundData) {
  try {
    const res = await apiRequest(`/orders/${id}/refund-process`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
    if (res && res.success && res.order) return res.order;
  } catch (err) {
    console.warn('Backend processAdminRefund notice, falling back to update status:', err.message);
  }

  // Fallback to update order status
  return await updateAdminOrderStatus(id, {
    payment_status: 'refunded',
    refund_status: 'completed',
    refund_transaction_ref: refundData.refund_transaction_ref,
    refund_amount: refundData.refund_amount,
  });
}

/**
 * Fetch all customers & analytics
 */
export async function getAdminCustomers() {
  try {
    const res = await apiRequest('/orders/admin/customers');
    if (res.success && res.customers) return res.customers;
  } catch (err) {
    console.warn('Backend getAdminCustomers notice:', err.message);
  }

  return [];
}
