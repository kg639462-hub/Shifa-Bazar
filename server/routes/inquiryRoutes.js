import express from 'express';
import { supabase, adminSupabase, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

// In-memory fallback inquiries storage
let mockInquiries = [];

// GET /api/inquiries - List all inquiries
router.get('/', async (req, res) => {
  try {
    const client = adminSupabase || supabase;
    if (isSupabaseConfigured() && client) {
      try {
        const { data, error } = await client
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return res.status(200).json({ success: true, inquiries: data });
        }
      } catch (err) {
        console.warn('Supabase fetch inquiries notice:', err.message);
      }
    }

    return res.status(200).json({ success: true, inquiries: mockInquiries });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/inquiries - Submit an inquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name and message are required',
      });
    }

    const newInquiry = {
      id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      status: 'new',
      created_at: new Date().toISOString(),
    };

    const client = adminSupabase || supabase;
    if (isSupabaseConfigured() && client) {
      try {
        const { data, error } = await client
          .from('inquiries')
          .insert([newInquiry])
          .select()
          .single();

        if (!error && data) {
          mockInquiries.unshift(data);
          return res.status(201).json({ success: true, inquiry: data });
        }
      } catch (err) {
        console.warn('Supabase insert inquiry notice:', err.message);
      }
    }

    mockInquiries.unshift(newInquiry);
    return res.status(201).json({ success: true, inquiry: newInquiry });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/inquiries/:id - Delete inquiry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = adminSupabase || supabase;
    if (isSupabaseConfigured() && client) {
      try {
        await client.from('inquiries').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete inquiry notice:', err.message);
      }
    }
    mockInquiries = mockInquiries.filter((inq) => inq.id !== id);
    return res.status(200).json({ success: true, message: 'Inquiry deleted' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
