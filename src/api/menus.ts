import { QrMenuEngine } from '../core/growth/qr-menu.engine';
import { DatabaseService } from '../core/database/db.service';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
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

  const urlObj = new URL(req.url || '/', 'http://localhost');
  const slug = (req.query && req.query.slug) || urlObj.searchParams.get('slug');
  const action = (req.query && req.query.action) || urlObj.searchParams.get('action');

  if (req.method === 'GET') {
    if (action === 'qr' && slug) {
      const origin = process.env.NEXT_PUBLIC_PRIMESOUL_URL || 'https://my-marketing-sales-agents.vercel.app';
      const menuUrl = `${origin}/qr-menu/${slug}`;
      const svg = QrMenuEngine.generateQrCodeSvg(menuUrl, 280);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `inline; filename="${slug}-qr.svg"`);
      return res.end(svg);
    }

    if (slug) {
      const restaurant = db.getRestaurantBySlug(slug);
      if (!restaurant) return sendJson(res, 404, { success: false, error: 'Restaurant menu not found' });
      eventService.logEvent('qr_menu_viewed', { metadata: { slug, restaurantId: restaurant.id } });
      return sendJson(res, 200, { success: true, restaurant });
    }

    const restaurants = db.getRestaurants();
    return sendJson(res, 200, { success: true, restaurants, count: restaurants.length });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

      if (action === 'category' || body.action === 'category') {
        const { restaurantId, name, sortOrder } = body;
        if (!restaurantId || !name) return sendJson(res, 400, { success: false, error: 'restaurantId and name required' });
        const cat = db.saveCategory({ restaurantId, name, sortOrder });
        return sendJson(res, 200, { success: true, category: cat });
      }

      if (action === 'item' || body.action === 'item') {
        const { restaurantId, categoryId, name, description, price, imageUrl, isVegetarian, isAvailable, id } = body;
        if (!restaurantId || !categoryId || !name || price === undefined) {
          return sendJson(res, 400, { success: false, error: 'restaurantId, categoryId, name and price are required' });
        }
        const item = db.saveMenuItem({
          id,
          restaurantId,
          categoryId,
          name,
          description,
          price: Number(price),
          imageUrl,
          isVegetarian: Boolean(isVegetarian),
          isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        });
        return sendJson(res, 200, { success: true, item });
      }

      const { businessName, phone, city, logoUrl, customSlug, referralCode } = body;
      if (!businessName || !phone) {
        return sendJson(res, 400, { success: false, error: 'Restaurant name and phone number are required.' });
      }

      const existingRestaurants = db.getRestaurants();
      const existingSlugs = existingRestaurants.map(r => r.slug);

      const generatedSlug = customSlug
        ? QrMenuEngine.generateSlug(customSlug, existingSlugs)
        : QrMenuEngine.generateSlug(businessName, existingSlugs);

      const restaurant = db.saveRestaurant({
        businessName: businessName.trim(),
        phone: phone.trim(),
        city: city ? city.trim() : 'India',
        logoUrl: logoUrl ? logoUrl.trim() : undefined,
        slug: generatedSlug,
        isPublished: true,
      });

      const { categories, items } = QrMenuEngine.createDefaultMenu(restaurant.id);
      for (const cat of categories) {
        db.saveCategory(cat);
      }
      for (const item of items) {
        db.saveMenuItem(item);
      }

      const lead = db.saveLead({
        businessName: businessName.trim(),
        contactName: businessName.trim() + ' Owner',
        phone: phone.trim(),
        city: city ? city.trim() : 'India',
        location: city ? city.trim() : 'India',
        businessCategory: 'Restaurant',
        industry: 'Restaurant / Food & Beverage',
        source: 'QR_MENU',
        sourceDetail: `qr_menu_${restaurant.slug}`,
        requirement: 'PrimeOMS',
        restaurantId: restaurant.id,
        referralCode: referralCode || undefined,
        growthStatus: 'QUALIFIED',
      });

      eventService.logEvent('qr_menu_created', {
        leadId: lead.id,
        metadata: { restaurantId: restaurant.id, slug: restaurant.slug },
      });

      const fullRestaurant = db.getRestaurantBySlug(restaurant.slug);

      return sendJson(res, 201, {
        success: true,
        restaurant: fullRestaurant,
        lead,
        slug: restaurant.slug,
        menuUrl: `/qr-menu/${restaurant.slug}`,
      });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to create QR menu' });
    }
  }

  if (req.method === 'DELETE') {
    const id = (req.query && req.query.id) || urlObj.searchParams.get('id');
    if (!id) return sendJson(res, 400, { success: false, error: 'id is required' });

    if (action === 'category') {
      const deleted = db.deleteCategory(id);
      return sendJson(res, 200, { success: deleted });
    }
    if (action === 'item') {
      const deleted = db.deleteMenuItem(id);
      return sendJson(res, 200, { success: deleted });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
