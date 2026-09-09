import { QrMenuEngine } from '../src/core/growth/qr-menu.engine';
import { DatabaseService } from '../src/core/database/db.service';
import { EventService } from '../src/core/growth/event.service';
import { siteConfig } from '../src/core/growth/site.config';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
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
  const urlObj = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
  const slug = (req.query && req.query.slug) || urlObj.searchParams.get('slug');
  const action = (req.query && req.query.action) || urlObj.searchParams.get('action');

  if (req.method === 'GET') {
    if (slug) {
      if (action === 'qr') {
        const publicUrl = `${siteConfig.url}/qr-menu/${slug}`;
        const svg = QrMenuEngine.generateQrCodeSvg(publicUrl, 280);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.statusCode = 200;
        return res.end(svg);
      }

      const restaurant = db.getRestaurantBySlug(slug);
      if (!restaurant) return sendJson(res, 404, { success: false, error: 'Restaurant not found' });
      return sendJson(res, 200, { success: true, restaurant });
    }

    const restaurants = db.getRestaurants();
    return sendJson(res, 200, { success: true, count: restaurants.length, restaurants });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

      if (action === 'category') {
        const restaurant = db.getRestaurantBySlug(slug || body.slug);
        if (!restaurant) return sendJson(res, 404, { success: false, error: 'Restaurant not found' });
        const cat = db.saveCategory({ restaurantId: restaurant.id, name: body.name, sortOrder: body.sortOrder });
        return sendJson(res, 200, { success: true, category: cat });
      }

      if (action === 'item') {
        const restaurant = db.getRestaurantBySlug(slug || body.slug);
        if (!restaurant) return sendJson(res, 404, { success: false, error: 'Restaurant not found' });
        const item = db.saveMenuItem({
          id: body.id,
          restaurantId: restaurant.id,
          categoryId: body.categoryId,
          name: body.name,
          description: body.description,
          price: Number(body.price),
          imageUrl: body.imageUrl,
          isAvailable: body.isAvailable !== false,
          isVegetarian: body.isVegetarian !== false,
          sortOrder: body.sortOrder,
        });
        return sendJson(res, 200, { success: true, item });
      }

      const { businessName, phone, city, logoUrl, customSlug, referralCode } = body;
      if (!businessName || !phone) {
        return sendJson(res, 400, { success: false, error: 'Restaurant name and phone are required' });
      }

      const existingRestaurants = db.getRestaurants();
      const existingSlugs = existingRestaurants.map(r => r.slug);
      const finalSlug = customSlug
        ? QrMenuEngine.generateSlug(customSlug, existingSlugs)
        : QrMenuEngine.generateSlug(businessName, existingSlugs);

      const restaurant = db.saveRestaurant({
        businessName,
        slug: finalSlug,
        phone,
        city: city || 'India',
        logoUrl,
        isPublished: true,
      });

      const defaultMenu = QrMenuEngine.createDefaultMenu(restaurant.id);
      for (const cat of defaultMenu.categories) db.saveCategory(cat);
      for (const item of defaultMenu.items) db.saveMenuItem(item);

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
        notes: `Created free QR digital menu at /qr-menu/${finalSlug}`,
      });

      if (referralCode) {
        db.trackReferralLead(referralCode);
      }

      eventService.logEvent('qr_menu_created', {
        leadId: lead.id,
        metadata: { restaurantId: restaurant.id, slug: finalSlug },
      });

      const full = db.getRestaurantBySlug(finalSlug);
      return sendJson(res, 200, { success: true, restaurant: full, lead });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to manage menu' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
