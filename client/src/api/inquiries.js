import { apiRequest } from './client';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'shifa_bazar_inquiries';

function getLocalInquiries() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalInquiries(inquiries) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inquiries));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

/**
 * Submit customer contact inquiry
 */
export async function submitInquiry(inquiryData) {
  const newInquiry = {
    id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: inquiryData.name?.trim() || 'Anonymous Patient',
    email: inquiryData.email?.trim() || '',
    phone: inquiryData.phone?.trim() || '',
    subject: inquiryData.subject?.trim() || 'General Inquiry',
    message: inquiryData.message?.trim() || '',
    status: 'new',
    created_at: new Date().toISOString(),
  };

  // 1. Always save to localStorage immediately so admin on this browser sees it instantly
  const localList = getLocalInquiries();
  localList.unshift(newInquiry);
  saveLocalInquiries(localList);

  // 2. Try inserting into Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('inquiries').insert([newInquiry]).select().single();
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('Direct Supabase inquiry insert notice:', e.message);
    }
  }

  // 3. Try backend API
  try {
    const res = await apiRequest('/inquiries', {
      method: 'POST',
      body: JSON.stringify(newInquiry),
    });
    if (res.success && res.inquiry) {
      return res.inquiry;
    }
  } catch (err) {
    console.warn('Backend inquiry submission notice:', err.message);
  }

  return newInquiry;
}

/**
 * Fetch all customer inquiries for Admin Portal
 */
export async function getInquiries() {
  let combined = [...getLocalInquiries()];

  // 1. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Merge Supabase data with local
        const idMap = new Map();
        [...data, ...combined].forEach((item) => {
          if (!idMap.has(item.id)) {
            idMap.set(item.id, item);
          }
        });
        combined = Array.from(idMap.values());
      }
    } catch (e) {
      console.warn('Direct Supabase fetch inquiries notice:', e.message);
    }
  }

  // 2. Try Backend API
  try {
    const res = await apiRequest('/inquiries');
    if (res.success && Array.isArray(res.inquiries)) {
      const idMap = new Map();
      [...res.inquiries, ...combined].forEach((item) => {
        if (!idMap.has(item.id)) {
          idMap.set(item.id, item);
        }
      });
      combined = Array.from(idMap.values());
    }
  } catch (err) {
    console.warn('Backend getInquiries notice:', err.message);
  }

  // Sort descending by date
  return combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

/**
 * Delete an inquiry
 */
export async function deleteInquiry(id) {
  // 1. Remove from local storage
  const localList = getLocalInquiries().filter((item) => item.id !== id);
  saveLocalInquiries(localList);

  // 2. Remove from Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('inquiries').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete inquiry notice:', e.message);
    }
  }

  // 3. Remove from Backend API
  try {
    await apiRequest(`/inquiries/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Backend delete inquiry notice:', err.message);
  }

  return true;
}
