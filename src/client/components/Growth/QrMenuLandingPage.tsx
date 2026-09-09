import React, { useState } from 'react';
import {
  QrCode,
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Phone,
  Building2,
  MapPin,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { apiService } from '../../services/api.service';
import { IQRRestaurant, IQRCategory, IQRMenuItem } from '../../../core/types/growth.types';
import { siteConfig, buildWhatsAppLink } from '../../../core/growth/site.config';

interface QrMenuLandingPageProps {
  onNavigate: (route: string) => void;
  referralCode?: string;
}

export const QrMenuLandingPage: React.FC<QrMenuLandingPageProps> = ({ onNavigate, referralCode }) => {
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [customSlug, setCustomSlug] = useState('');

  const [loading, setLoading] = useState(false);
  const [createdRestaurant, setCreatedRestaurant] = useState<IQRRestaurant | null>(null);

  // Quick item addition state inside editor
  const [newCatName, setNewCatName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCatId, setNewItemCatId] = useState('');
  const [isVeg, setIsVeg] = useState(true);

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim()) {
      alert('Please provide your restaurant name and phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.createRestaurant({
        businessName: businessName.trim(),
        phone: phone.trim(),
        city: city.trim() || 'India',
        customSlug: customSlug.trim() || undefined,
        referralCode,
      });

      if (res && res.restaurant) {
        setCreatedRestaurant(res.restaurant);
        if (res.restaurant.categories && res.restaurant.categories.length > 0) {
          setNewItemCatId(res.restaurant.categories[0].id);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create QR menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim() || !createdRestaurant) return;
    try {
      const res = await apiService.addCategory(createdRestaurant.slug, newCatName.trim(), createdRestaurant.id);
      if (res && res.category) {
        const refreshed = await apiService.getRestaurantBySlug(createdRestaurant.slug);
        if (refreshed) setCreatedRestaurant(refreshed);
        setNewCatName('');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemPrice || !newItemCatId || !createdRestaurant) return;
    try {
      const res = await apiService.addMenuItem({
        restaurantId: createdRestaurant.id,
        categoryId: newItemCatId,
        name: newItemName.trim(),
        price: Number(newItemPrice),
        description: newItemDesc.trim() || undefined,
        isVegetarian: isVeg,
        isAvailable: true,
      });

      if (res && res.item) {
        const refreshed = await apiService.getRestaurantBySlug(createdRestaurant.slug);
        if (refreshed) setCreatedRestaurant(refreshed);
        setNewItemName('');
        setNewItemPrice('');
        setNewItemDesc('');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!createdRestaurant) return;
    try {
      await apiService.deleteMenuItem(itemId);
      const refreshed = await apiService.getRestaurantBySlug(createdRestaurant.slug);
      if (refreshed) setCreatedRestaurant(refreshed);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const publicUrl = createdRestaurant ? `${window.location.origin}/qr-menu/${createdRestaurant.slug}` : '';
  const qrSvgUrl = createdRestaurant ? `/api/menus?action=qr&slug=${createdRestaurant.slug}` : '';

  const handleDownloadQr = () => {
    if (!qrSvgUrl) return;
    const a = document.createElement('a');
    a.href = qrSvgUrl;
    a.download = `${createdRestaurant?.slug || 'restaurant'}-qr-menu.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const primeOmsDemoWhatsapp = buildWhatsAppLink(
    `Hi PrimeSoul! I created a free QR menu for ${createdRestaurant?.businessName || 'my restaurant'} and would like to see a demo of PrimeOMS table ordering & kitchen management.`
  );

  return (
    <div className="qrmenu-page-root">
      {/* Hero Header */}
      <div className="qrmenu-hero-header">
        <div className="max-w-3xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <UtensilsCrossed size={13} /> Free for Restaurants & Cafes
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Create Your Free Digital QR Menu
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            Give customers a seamless contactless menu on their smartphones. Update prices, add items, and download high-resolution QR codes in 2 minutes.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!createdRestaurant ? (
          /* Step 1: Create Restaurant Form */
          <div className="qrmenu-form-container max-w-xl mx-auto">
            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div className="space-y-1">
                <label className="form-label text-xs font-semibold">
                  Restaurant / Cafe Name <span className="text-rose-400">*</span>
                </label>
                <div className="input-with-icon">
                  <Building2 size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Spice Family Restaurant"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="form-label text-xs font-semibold">
                    Phone Number (WhatsApp) <span className="text-rose-400">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="text"
                      required
                      placeholder="+91 98290 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="form-label text-xs font-semibold">City</label>
                  <div className="input-with-icon">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Jaipur, Udaipur, Pune"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="form-label text-xs font-semibold">
                  Custom Menu Link <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-400">
                  <span className="shrink-0 text-slate-500">/qr-menu/</span>
                  <input
                    type="text"
                    placeholder="royal-spice-jaipur"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="bg-transparent text-white focus:outline-none ml-1 w-full text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary bg-emerald-600 hover:bg-emerald-500 py-3.5 text-base font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center"
                >
                  <QrCode size={18} className="mr-2" /> {loading ? 'Creating Your QR Menu...' : 'Create Free QR Menu'}
                </button>
              </div>

              <div className="text-center text-xs text-slate-400 pt-1">
                ✨ Free forever • No app download required • Instant live link
              </div>
            </form>
          </div>
        ) : (
          /* Step 2: Live QR Menu Manager & Editor */
          <div className="space-y-8 animate-fadeIn">
            {/* Success Bar & QR Showcase */}
            <div className="card-panel bg-gradient-to-r from-slate-900 to-emerald-950/30 border-emerald-500/30 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className="badge-free bg-emerald-500/20 text-emerald-300">
                    ✓ QR Menu Live & Active
                  </span>
                  <h2 className="text-2xl font-bold text-white">{createdRestaurant.businessName}</h2>
                  <p className="text-xs text-slate-300">
                    Public Menu URL:{' '}
                    <a
                      href={`/qr-menu/${createdRestaurant.slug}`}
                      onClick={(e) => { e.preventDefault(); onNavigate(`/qr-menu/${createdRestaurant.slug}`); }}
                      className="text-emerald-400 hover:underline font-mono"
                    >
                      /qr-menu/{createdRestaurant.slug}
                    </a>
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                    <button
                      onClick={() => onNavigate(`/qr-menu/${createdRestaurant.slug}`)}
                      className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center"
                    >
                      <ExternalLink size={13} className="mr-1" /> Open Live Menu
                    </button>
                    <button
                      onClick={handleDownloadQr}
                      className="btn-secondary text-xs py-1.5 px-3 border-emerald-500/40 text-emerald-300 inline-flex items-center"
                    >
                      <Download size={13} className="mr-1" /> Download QR Code
                    </button>
                  </div>
                </div>

                {/* QR Code Preview Box */}
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-700 shrink-0 text-center">
                  <img
                    src={qrSvgUrl}
                    alt="QR Code"
                    className="w-36 h-36 mx-auto"
                  />
                  <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wide mt-1">
                    Scan for Menu
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items & Categories Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Add Category / Add Item */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Add Category */}
                <div className="card-panel">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <Plus size={15} className="text-indigo-400" /> Add Menu Category
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Soups, Tandoor Specials"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="form-input text-xs"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="btn-primary text-xs py-2 px-3 shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* 2. Add Item */}
                <div className="card-panel space-y-3">
                  <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                    <Plus size={15} className="text-emerald-400" /> Add Dish / Item
                  </h4>

                  <div>
                    <label className="form-label text-[11px]">Select Category</label>
                    <select
                      value={newItemCatId}
                      onChange={(e) => setNewItemCatId(e.target.value)}
                      className="form-input text-xs bg-slate-900"
                    >
                      {(createdRestaurant.categories || []).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label text-[11px]">Dish Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kadhai Paneer / Cold Coffee"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="form-label text-[11px]">Price (INR ₹)</label>
                      <input
                        type="number"
                        placeholder="249"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        className="form-input text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isVeg}
                          onChange={(e) => setIsVeg(e.target.checked)}
                          className="rounded border-slate-700 text-emerald-500"
                        />
                        <span>🌱 Vegetarian</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-[11px]">Short Description (Optional)</label>
                    <input
                      type="text"
                      placeholder="Spicy gravy with fresh bell peppers"
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>

                  <button
                    onClick={handleAddItem}
                    className="w-full btn-primary bg-emerald-600 hover:bg-emerald-500 text-xs py-2.5 font-bold"
                  >
                    + Add to Digital Menu
                  </button>
                </div>
              </div>

              {/* Right Column: Menu Hierarchy Preview */}
              <div className="lg:col-span-7 card-panel space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white">Menu Structure & Dishes</h4>
                  <span className="text-xs text-slate-400">
                    {createdRestaurant.items?.length || 0} Total Dishes
                  </span>
                </div>

                {(createdRestaurant.categories || []).length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No categories yet. Add your first category on the left.</p>
                ) : (
                  <div className="space-y-5">
                    {createdRestaurant.categories?.map((cat) => {
                      const itemsInCat = (createdRestaurant.items || []).filter(i => i.categoryId === cat.id);
                      return (
                        <div key={cat.id} className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-indigo-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-slate-400">{itemsInCat.length} items</span>
                          </div>

                          <div className="space-y-1.5 pl-2">
                            {itemsInCat.length === 0 ? (
                              <div className="text-[11px] text-slate-500 italic py-1">No items in this category yet.</div>
                            ) : (
                              itemsInCat.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 text-xs"
                                >
                                  <div className="space-y-0.5">
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                      <span className={item.isVegetarian ? 'text-emerald-400' : 'text-rose-400'}>
                                        {item.isVegetarian ? '🟢' : '🔴'}
                                      </span>
                                      <span>{item.name}</span>
                                    </div>
                                    {item.description && (
                                      <div className="text-[11px] text-slate-400">{item.description}</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-mono font-bold text-emerald-400">₹{item.price}</span>
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="text-slate-500 hover:text-rose-400 p-1"
                                      title="Delete item"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* PrimeOMS Natural Conversion Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <Zap size={14} /> Ready for Table Ordering & Kitchen Orders?
                  </div>
                  <h3 className="text-lg font-bold text-white">Upgrade to PrimeOMS Restaurant OS</h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Allow customers to order and pay directly from the table, send digital KOTs straight to kitchen displays, and capture customer WhatsApp numbers for repeat orders.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <a
                    href={primeOmsDemoWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary bg-cyan-600 hover:bg-cyan-500 text-xs py-2.5 px-4 font-bold flex items-center"
                  >
                    <MessageSquare size={14} className="mr-1.5" /> Book PrimeOMS Demo
                  </a>
                  <button
                    onClick={() => onNavigate('/for-restaurants')}
                    className="btn-secondary text-xs py-2.5 px-3 border-cyan-500/40 text-cyan-300"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
