import { DatabaseService } from '../core/database/db.service';
import { QrMenuEngine } from '../core/growth/qr-menu.engine';
import { EventService } from '../core/growth/event.service';

function sendJson(res: any, status: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const db = DatabaseService.getInstance();
  const eventService = EventService.getInstance();

  if (req.method === 'GET') {
    try {
      const slug = req.query?.slug as string;
      const action = req.query?.action as string;

      // QR Code Generation
      if (action === 'qr') {
        const targetSlug = slug || 'default';
        const baseUrl = process.env.NEXT_PUBLIC_PRIMESOUL_URL || 'https://my-marketing-sales-agents.vercel.app';
        const publicMenuUrl = `${baseUrl}/qr-menu/${targetSlug}`;
        const svg = QrMenuEngine.generateQrCodeSvg(publicMenuUrl, 280);

        if (typeof res.setHeader === 'function') {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
        res.statusCode = 200;
        return res.end(svg);
      }

      if (slug) {
        const restaurant = db.getRestaurantBySlug(slug);
        if (!restaurant) {
          return sendJson(res, 404, { success: false, error: 'Restaurant menu not found' });
        }
        eventService.logEvent('qr_menu_viewed', { metadata: { slug: restaurant.slug, restaurantId: restaurant.id } });
        return sendJson(res, 200, { success: true, restaurant });
      }

      const restaurants = db.getRestaurants();
      return sendJson(res, 200, { success: true, count: restaurants.length, restaurants });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};
      const action = (req.query?.action || body.action) as string;

      // 1. Add / Edit Category
      if (action === 'category') {
        const { restaurantId, name, sortOrder, id } = body;
        if (!restaurantId || !name) {
          return sendJson(res, 400, { success: false, error: 'restaurantId and name are required' });
        }
        const category = db.saveCategory({ id, restaurantId, name, sortOrder });
        return sendJson(res, 200, { success: true, category });
      }

      // 2. Add / Edit Menu Item
      if (action === 'item') {
        const { restaurantId, categoryId, name, description, price, imageUrl, isAvailable, isVegetarian, sortOrder, id } = body;
        if (!restaurantId || !categoryId || !name || price === undefined) {
          return sendJson(res, 400, { success: false, error: 'restaurantId, categoryId, name, and price are required' });
        }
        const item = db.saveMenuItem({
          id,
          restaurantId,
          categoryId,
          name,
          description,
          price: Number(price),
          imageUrl,
          isAvailable: isAvailable !== false,
          isVegetarian: isVegetarian !== false,
          sortOrder,
        });
        return sendJson(res, 200, { success: true, item });
      }

      // 3. Create / Register Restaurant
      const { businessName, phone, city, logoUrl, customSlug, referralCode } = body;
      if (!businessName || !phone) {
        return sendJson(res, 400, { success: false, error: 'Restaurant name and phone number are required.' });
      }

      const existingRestaurants = db.getRestaurants();
      const existingSlugs = existingRestaurants.map(r => r.slug);
      const slug = customSlug
        ? QrMenuEngine.generateSlug(customSlug, existingSlugs)
        : QrMenuEngine.generateSlug(businessName, existingSlugs);

      const restaurant = db.saveRestaurant({
        businessName,
        slug,
        phone,
        city: city || 'India',
        logoUrl,
        isPublished: true,
      });

      // Initialize default menu categories and items for the restaurant
      const defaultMenu = QrMenuEngine.createDefaultMenu(restaurant.id);
      for (const cat of defaultMenu.categories) {
        db.saveCategory(cat);
      }
      for (const item of defaultMenu.items) {
        db.saveMenuItem(item);
      }

      // Automatically capture CRM lead with high intent
      const lead = db.saveLead({
        businessName,
        businessCategory: 'Restaurant',
        industry: 'Hospitality',
        location: city || 'India',
        city: city || 'India',
        phone,
        source: referralCode ? 'REFERRAL' : 'QR_MENU',
        sourceDetail: referralCode ? `referral_${referralCode}` : 'qr_menu_creation',
        requirement: 'Restaurant QR Menu',
        timeline: 'Immediately',
        growthStatus: 'QUALIFIED',
        restaurantId: restaurant.id,
        referralCode,
        notes: `Created free QR digital menu at /qr-menu/${slug}`,
        notesList: [
          {
            id: `note-${Date.now().toString(36)}`,
            leadId: '',
            author: 'Growth Engine',
            content: `Restaurant created QR menu (/qr-menu/${slug}) with default menu template.`,
            createdAt: new Date().toISOString(),
          }
        ],
      });

      if (referralCode) {
        db.trackReferralLead(referralCode);
      }

      eventService.logEvent('qr_menu_created', {
        leadId: lead.id,
        metadata: { restaurantId: restaurant.id, slug: restaurant.slug },
      });

      const fullRestaurant = db.getRestaurantBySlug(restaurant.slug);

      return sendJson(res, 200, {
        success: true,
        restaurant: fullRestaurant,
        lead,
      });
    } catch (err: any) {
      console.error('Menu API error:', err);
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to process menu request' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const action = req.query?.action as string;
      const id = req.query?.id as string;

      if (!id) return sendJson(res, 400, { success: false, error: 'id is required' });

      if (action === 'category') {
        const ok = db.deleteCategory(id);
        return sendJson(res, 200, { success: ok });
      }

      if (action === 'item') {
        const ok = db.deleteMenuItem(id);
        return sendJson(res, 200, { success: ok });
      }

      return sendJson(res, 400, { success: false, error: 'Invalid delete action' });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
