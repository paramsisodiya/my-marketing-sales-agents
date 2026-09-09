import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Phone, MapPin, Search, ArrowUpRight, Share2, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { apiService } from '../../services/api.service';
import { IQRRestaurant, IQRCategory, IQRMenuItem } from '../../../core/types/growth.types';
import { siteConfig } from '../../../core/growth/site.config';

interface PublicMenuViewProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const PublicMenuView: React.FC<PublicMenuViewProps> = ({ slug, onNavigate }) => {
  const [restaurant, setRestaurant] = useState<IQRRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await apiService.getRestaurantBySlug(slug);
        if (res) {
          setRestaurant(res);
        } else {
          setError('Restaurant menu not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load restaurant menu.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 size={32} className="animate-spin text-emerald-400 mb-3" />
        <div className="text-sm font-semibold text-slate-300">Loading Menu...</div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <UtensilsCrossed size={28} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Menu Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          The restaurant menu you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => onNavigate('/qr-menu')}
          className="btn-primary text-xs py-2.5 px-4"
        >
          Create a Free QR Menu
        </button>
      </div>
    );
  }

  const categories = restaurant.categories || [];
  let items = restaurant.items || [];

  if (activeCategory !== 'ALL') {
    items = items.filter(i => i.categoryId === activeCategory);
  }

  if (vegOnly) {
    items = items.filter(i => i.isVegetarian);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
  }

  return (
    <div className="public-menu-root min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Restaurant Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 px-4 pt-6 pb-5 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-xl mx-auto flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Digital Menu
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {restaurant.businessName}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              {restaurant.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-slate-500" /> {restaurant.city}
                </span>
              )}
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Phone size={12} /> Call Restaurant
                </a>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('/qr-menu')}
            className="text-[11px] text-slate-400 hover:text-white shrink-0 p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-1"
            title="Create your own free QR menu"
          >
            <Sparkles size={12} className="text-emerald-400" /> Free QR Menu
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="max-w-xl mx-auto mt-4 space-y-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Paneer, Pizza, Coffee)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Category Chips Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              All Items ({restaurant.items?.length || 0})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ml-auto ${
                vegOnly
                  ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              🌱 Veg Only
            </button>
          </div>
        </div>
      </div>

      {/* Menu Dishes List */}
      <div className="max-w-xl mx-auto px-4 pt-4 space-y-3">
        {items.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <UtensilsCrossed size={28} className="mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-400">No dishes match your search or filter.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 flex items-start justify-between gap-4 transition-colors"
            >
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs shrink-0" title={item.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}>
                    {item.isVegetarian ? '🟢' : '🔴'}
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {item.name}
                  </h3>
                </div>
                {item.description && (
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="shrink-0 text-right">
                <div className="text-sm font-mono font-black text-emerald-400">
                  ₹{item.price}
                </div>
                {!item.isAvailable && (
                  <span className="text-[10px] text-rose-400 font-semibold block mt-1">
                    Sold Out
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Powered by PrimeOMS Footer & Upsell Banner */}
      <div className="max-w-xl mx-auto px-4 mt-12 pt-6 border-t border-slate-800/80 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              Restaurant Technology
            </span>
            <span className="text-[10px] text-slate-500">PrimeOMS</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Want customers to order and pay directly from their table?
          </p>
          <div className="flex items-center justify-between pt-1">
            <a
              href={siteConfig.primeOmsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center"
            >
              Explore PrimeOMS Table Ordering <ArrowUpRight size={13} className="ml-1" />
            </a>
            <button
              onClick={() => onNavigate('/qr-menu')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Create Free Menu
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Powered by <strong className="text-slate-400">PrimeOMS</strong> • Free Restaurant Growth Tools
        </div>
      </div>
    </div>
  );
};
