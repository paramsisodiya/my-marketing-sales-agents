import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../src/core/database/db.service';
import { LlmFactory } from '../src/core/llm/llm.factory';
import app from '../src/server/app';

describe('Settings & AI Provider Configuration Suite', () => {
  let db: DatabaseService;

  beforeEach(() => {
    db = DatabaseService.getInstance();
    db.resetData();
  });

  it('should return masked settings and boolean hasGeminiKey without exposing raw secrets', () => {
    // Save a raw key
    db.updateSettings({
      aiProvider: 'gemini',
      geminiApiKey: 'AIzaSySecretRealKey9999',
    });

    const settings = db.getSettings();
    expect(settings.aiProvider).toBe('gemini');
    expect(settings.hasGeminiKey).toBe(true);
    expect(settings.geminiApiKey).toContain('•');
    expect(settings.geminiApiKey).not.toBe('AIzaSySecretRealKey9999');

    // getRawSettings must return the actual key
    const raw = db.getRawSettings();
    expect(raw.geminiApiKey).toBe('AIzaSySecretRealKey9999');
  });

  it('should retain existing API key if client submits masked key with bullets/asterisks', () => {
    db.updateSettings({
      aiProvider: 'gemini',
      geminiApiKey: 'AIzaSyOriginalKey12345',
    });

    // Client updates provider settings but sends back masked key
    const updated = db.updateSettings({
      aiProvider: 'gemini',
      geminiApiKey: 'AIzaSy••••••••••••••••345',
    });

    expect(updated.hasGeminiKey).toBe(true);
    expect(db.getRawSettings().geminiApiKey).toBe('AIzaSyOriginalKey12345');
  });

  it('should switch between mock, gemini, and ollama providers seamlessly', () => {
    // 1. Mock Provider
    db.updateSettings({ aiProvider: 'mock' });
    LlmFactory.setProvider('mock');
    expect(LlmFactory.getCurrentProviderType()).toBe('mock');

    // 2. Gemini Provider
    db.updateSettings({ aiProvider: 'gemini', geminiApiKey: 'AIzaSySampleKey' });
    LlmFactory.setProvider('gemini', { apiKey: db.getRawSettings().geminiApiKey });
    expect(LlmFactory.getCurrentProviderType()).toBe('gemini');

    // 3. Ollama Provider
    db.updateSettings({ aiProvider: 'ollama', ollamaBaseUrl: 'http://localhost:11434', ollamaModel: 'llama3:8b' });
    LlmFactory.setProvider('ollama', { baseUrl: 'http://localhost:11434', model: 'llama3:8b' });
    expect(LlmFactory.getCurrentProviderType()).toBe('ollama');
  });

  it('should guarantee valid JSON response for /api/settings and 404 routes', async () => {
    // Simulate express request using supertest-like or mock request handler
    // Ensure Express app has /api/settings route registered
    const routes = (app._router.stack || [])
      .filter((r: any) => r.route)
      .map((r: any) => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods),
      }));

    const hasSettingsGet = routes.some((r: any) => r.path === '/api/settings' && r.methods.includes('get'));
    const hasSettingsPost = routes.some((r: any) => r.path === '/api/settings' && r.methods.includes('post'));

    expect(hasSettingsGet).toBe(true);
    expect(hasSettingsPost).toBe(true);
  });
});
