import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Cpu,
  ShieldCheck,
  Check,
  Save,
  HelpCircle,
  ExternalLink,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { apiService } from '../../services/api.service';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
}) => {
  const [provider, setProvider] = useState<'mock' | 'gemini' | 'ollama'>('mock');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [maskedPreview, setMaskedPreview] = useState('');
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3:8b');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      apiService.getSettings()
        .then(settings => {
          if (settings) {
            setProvider(settings.aiProvider || 'mock');
            setHasStoredKey(Boolean(settings.hasGeminiKey));
            setMaskedPreview(settings.maskedGeminiKey || settings.geminiApiKey || '');
            setGeminiApiKey(settings.geminiApiKey || '');
            setOllamaBaseUrl(settings.ollamaBaseUrl || 'http://localhost:11434');
            setOllamaModel(settings.ollamaModel || 'llama3:8b');
          }
        })
        .catch(err => {
          console.warn('Could not load remote settings, using local defaults:', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Validate key if switching to Gemini and no key is configured
      if (provider === 'gemini' && !hasStoredKey && (!geminiApiKey || geminiApiKey.trim().length === 0)) {
        throw new Error('Please enter a valid Google Gemini API key to activate Gemini provider.');
      }

      await apiService.updateSettings({
        aiProvider: provider,
        geminiApiKey: geminiApiKey.trim(),
        ollamaBaseUrl: ollamaBaseUrl.trim(),
        ollamaModel: ollamaModel.trim(),
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onSettingsSaved();
        onClose();
      }, 900);
    } catch (err: any) {
      const msg = err?.message || 'Failed to save settings. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100,
    }}>
      <div className="glass-card" style={{ width: '560px', maxWidth: '92vw', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', margin: 0 }}>AI Provider & Engine Configuration</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444',
            fontSize: '12.5px',
            marginBottom: '16px',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Provider Selection */}
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Active Intelligence Provider
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div
                onClick={() => setProvider('mock')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'mock' ? '2px solid var(--emerald)' : '1px solid var(--border-subtle)',
                  backgroundColor: provider === 'mock' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>₹0 Offline Mock</div>
                <div style={{ fontSize: '11px', color: 'var(--emerald)', marginTop: '2px' }}>Deterministic & Fast</div>
              </div>

              <div
                onClick={() => setProvider('gemini')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'gemini' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: provider === 'gemini' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>Google Gemini</div>
                <div style={{ fontSize: '11px', color: 'var(--cyan)', marginTop: '2px' }}>Free Tier Ready</div>
              </div>

              <div
                onClick={() => setProvider('ollama')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'ollama' ? '2px solid var(--purple)' : '1px solid var(--border-subtle)',
                  backgroundColor: provider === 'ollama' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>Local Ollama</div>
                <div style={{ fontSize: '11px', color: 'var(--purple)', marginTop: '2px' }}>Open Source</div>
              </div>
            </div>
          </div>

          {/* Conditional Provider Settings */}
          {provider === 'gemini' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Gemini API Key (Google AI Studio Free Tier)
                </label>
                {hasStoredKey && (
                  <span style={{ fontSize: '11px', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={12} /> Key Configured
                  </span>
                )}
              </div>
              <input
                type="password"
                className="form-input"
                placeholder={hasStoredKey && maskedPreview ? maskedPreview : "AIzaSy..."}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                autoComplete="off"
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {hasStoredKey && !geminiApiKey
                  ? 'Key is saved securely. Leave blank to keep existing key, or type a new key to update.'
                  : 'You can obtain a 100% free API key from Google AI Studio.'}
              </div>
            </div>
          )}

          {provider === 'ollama' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ollama Base URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Model</label>
                <input
                  type="text"
                  className="form-input"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ₹0 Strategy Info Box */}
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '12.5px',
            color: 'var(--text-primary)',
            lineHeight: '1.45',
          }}>
            <strong style={{ color: 'var(--emerald)' }}>PrimeSoul Cost Architecture:</strong> The entire multi-agent system runs locally at ₹0 cost using the Deterministic Heuristic Engine. You can switch to live LLMs anytime without changing business logic.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ gap: '6px' }}>
              {savedSuccess ? <Check size={14} color="var(--emerald)" /> : <Save size={14} />}
              <span>{isSaving ? 'Saving...' : savedSuccess ? 'Configured!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
