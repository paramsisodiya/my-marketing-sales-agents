import React, { useState } from 'react';
import { QrCode, ExternalLink, Download, Plus, UtensilsCrossed, Trash2, Edit2, Phone, MapPin } from 'lucide-react';
import { IQRRestaurant } from '../../../core/types/growth.types';
import { apiService } from '../../services/api.service';

interface QrMenusManagerViewProps {
  restaurants: IQRRestaurant[];
  onRefresh: () => void;
  onNavigate: (route: string) => void;
}

export const QrMenusManagerView: React.FC<QrMenusManagerViewProps> = ({ restaurants, onRefresh, onNavigate }) => {
  const [selectedRest, setSelectedRest] = useState<IQRRestaurant | null>(null);

  const handleDownloadQr = (slug: string, name: string) => {
    const a = document.createElement('a');
    a.href = `/api/menus?action=qr&slug=${slug}`;
    a.download = `${slug}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode size={20} className="text-emerald-400" /> Restaurant QR Digital Menus
          </h2>
          <p className="text-xs text-slate-400">
            {restaurants.length} active digital menus deployed
          </p>
        </div>

        <button
          onClick={() => onNavigate('/qr-menu')}
          className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-xs py-2 px-3.5 font-bold flex items-center"
        >
          <Plus size={14} className="mr-1.5" /> Create New Restaurant Menu
        </button>
      </div>

      {/* Grid of Restaurants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.length === 0 ? (
          <div className="col-span-full card-panel text-center py-12 text-slate-500">
            No QR menus created yet. Click "Create New Restaurant Menu" to add the first one.
          </div>
        ) : (
          restaurants.map((rest) => {
            const qrSvgUrl = `/api/menus?action=qr&slug=${rest.slug}`;
            return (
              <div key={rest.id} className="card-panel flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="badge-free bg-emerald-500/20 text-emerald-300 text-[10px]">
                        ✓ Live
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{rest.businessName}</h3>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>📍 {rest.city}</span>
                        <span>📞 {rest.phone}</span>
                      </div>
                    </div>

                    <img
                      src={qrSvgUrl}
                      alt="QR"
                      className="w-16 h-16 rounded-lg bg-white p-1 shadow border border-slate-700 shrink-0"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>Categories: <strong className="text-slate-200">{(rest.categories || []).length}</strong></div>
                    <div>Total Dishes: <strong className="text-slate-200">{(rest.items || []).length}</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onNavigate(`/qr-menu/${rest.slug}`)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center"
                  >
                    Open Menu <ExternalLink size={12} className="ml-1" />
                  </button>

                  <button
                    onClick={() => handleDownloadQr(rest.slug, rest.businessName)}
                    className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center"
                  >
                    <Download size={12} className="mr-1" /> Download QR
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
