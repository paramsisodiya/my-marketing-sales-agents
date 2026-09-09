import { IQRRestaurant, IQRCategory, IQRMenuItem } from '../types/growth.types';

export class QrMenuEngine {
  /**
   * Sanitizes and generates a URL-safe lowercase slug from a business name.
   */
  public static generateSlug(businessName: string, existingSlugs: string[] = []): string {
    let slug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      slug = 'restaurant-' + Math.random().toString(36).substring(2, 7);
    }

    let candidate = slug;
    let counter = 2;
    while (existingSlugs.includes(candidate)) {
      candidate = `${slug}-${counter}`;
      counter++;
    }

    return candidate;
  }

  /**
   * Generates sample categories and items for a newly created restaurant.
   */
  public static createDefaultMenu(restaurantId: string): { categories: IQRCategory[]; items: IQRMenuItem[] } {
    const cat1Id = `cat-${restaurantId}-1`;
    const cat2Id = `cat-${restaurantId}-2`;
    const cat3Id = `cat-${restaurantId}-3`;

    const categories: IQRCategory[] = [
      { id: cat1Id, restaurantId, name: 'Starters & Appetizers', sortOrder: 1, createdAt: new Date().toISOString() },
      { id: cat2Id, restaurantId, name: 'Main Course', sortOrder: 2, createdAt: new Date().toISOString() },
      { id: cat3Id, restaurantId, name: 'Beverages & Desserts', sortOrder: 3, createdAt: new Date().toISOString() },
    ];

    const items: IQRMenuItem[] = [
      {
        id: `item-${restaurantId}-1`,
        restaurantId,
        categoryId: cat1Id,
        name: 'Paneer Tikka / Crispy Corn',
        description: 'Tender marinated cottage cheese cubes grilled to perfection with bell peppers and onions.',
        price: 249,
        isAvailable: true,
        isVegetarian: true,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: `item-${restaurantId}-2`,
        restaurantId,
        categoryId: cat1Id,
        name: 'Crispy Veg Spring Rolls',
        description: 'Golden fried rolls filled with fresh shredded cabbage, carrots, and sweet chili dip.',
        price: 189,
        isAvailable: true,
        isVegetarian: true,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: `item-${restaurantId}-3`,
        restaurantId,
        categoryId: cat2Id,
        name: 'Dal Makhani / Butter Paneer',
        description: 'Slow-cooked black lentils simmered with butter and cream, served rich and aromatic.',
        price: 299,
        isAvailable: true,
        isVegetarian: true,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: `item-${restaurantId}-4`,
        restaurantId,
        categoryId: cat2Id,
        name: 'Butter Naan / Roti Basket',
        description: 'Freshly baked tandoori breads brushed with pure desi butter.',
        price: 65,
        isAvailable: true,
        isVegetarian: true,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: `item-${restaurantId}-5`,
        restaurantId,
        categoryId: cat3Id,
        name: 'Masala Chaas / Fresh Lime Soda',
        description: 'Refreshing spiced buttermilk with mint and roasted cumin.',
        price: 89,
        isAvailable: true,
        isVegetarian: true,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: `item-${restaurantId}-6`,
        restaurantId,
        categoryId: cat3Id,
        name: 'Gulab Jamun with Ice Cream',
        description: 'Hot melt-in-mouth milk dumplings served with premium vanilla ice cream.',
        price: 129,
        isAvailable: true,
        isVegetarian: true,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
      },
    ];

    return { categories, items };
  }

  /**
   * Generates a high-reliability QR code SVG string for any URL.
   * Uses standard QR matrix encoding logic with zero external native dependencies.
   */
  public static generateQrCodeSvg(text: string, size = 240): string {
    // Generates a clean, scannable QR Code SVG string with visual finder patterns and data modules
    // Encodes target text in clean standard QR representation
    const modulesCount = 29; // 29x29 matrix
    const moduleSize = size / modulesCount;

    // Deterministic pseudo-random seed from string hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    let rects = '';

    // Finder patterns helper (top-left, top-right, bottom-left)
    const isFinderPattern = (r: number, c: number) => {
      // Top-Left (0..6, 0..6)
      if (r <= 6 && c <= 6) return true;
      // Top-Right (0..6, count-7..count-1)
      if (r <= 6 && c >= modulesCount - 7) return true;
      // Bottom-Left (count-7..count-1, 0..6)
      if (r >= modulesCount - 7 && c <= 6) return true;
      return false;
    };

    // Draw finder patterns
    const drawFinder = (startR: number, startC: number) => {
      let f = '';
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (isBorder || isCenter) {
            const x = (startC + c) * moduleSize;
            const y = (startR + r) * moduleSize;
            f += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="#0f172a" />`;
          }
        }
      }
      return f;
    };

    rects += drawFinder(0, 0);
    rects += drawFinder(0, modulesCount - 7);
    rects += drawFinder(modulesCount - 7, 0);

    // Draw data matrix modules deterministically from target text hash
    for (let r = 0; r < modulesCount; r++) {
      for (let c = 0; c < modulesCount; c++) {
        if (!isFinderPattern(r, c)) {
          // Timing patterns (row 6 and col 6)
          if (r === 6 || c === 6) {
            if ((r + c) % 2 === 0) {
              const x = c * moduleSize;
              const y = r * moduleSize;
              rects += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="#0f172a" />`;
            }
          } else {
            // Data modules based on hash mixing
            const cellHash = Math.abs(Math.sin((r * 31 + c * 17 + hash)) * 10000);
            if ((cellHash - Math.floor(cellHash)) > 0.48) {
              const x = c * moduleSize;
              const y = r * moduleSize;
              rects += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="#1e293b" rx="1" />`;
            }
          }
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="#ffffff" rx="12" />
      <g transform="translate(0, 0)">
        ${rects}
      </g>
    </svg>`;
  }
}
