import { DatabaseService } from '../src/core/database/db.service';
import { LlmFactory } from '../src/core/llm/llm.factory';
import { LoggerService } from '../src/core/observability/logger.service';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = DatabaseService.getInstance();
  const logger = LoggerService.getInstance();

  if (req.method === 'GET') {
    try {
      const settings = db.getSettings();
      return res.status(200).json({ success: true, settings });
    } catch (err: any) {
      console.error('Settings GET error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to retrieve settings' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { aiProvider, geminiApiKey, ollamaBaseUrl, ollamaModel } = body;

      if (aiProvider && !['mock', 'gemini', 'ollama'].includes(aiProvider)) {
        return res.status(400).json({
          success: false,
          error: `Invalid AI Provider '${aiProvider}'. Must be 'mock', 'gemini', or 'ollama'.`,
        });
      }

      const updated = db.updateSettings({
        aiProvider,
        geminiApiKey,
        ollamaBaseUrl,
        ollamaModel,
      });

      const rawSettings = db.getRawSettings();
      if (rawSettings.aiProvider) {
        LlmFactory.setProvider(rawSettings.aiProvider, {
          apiKey: rawSettings.geminiApiKey,
          baseUrl: rawSettings.ollamaBaseUrl,
          model: rawSettings.ollamaModel,
        });
      }

      const hasKey = Boolean(rawSettings.geminiApiKey && rawSettings.geminiApiKey.trim().length > 0);
      logger.info(`Settings updated. Active AI Provider: ${updated.aiProvider}, Gemini Configured: ${hasKey}`);
      return res.status(200).json({ success: true, settings: updated });
    } catch (err: any) {
      console.error('Settings POST error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to save settings' });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}
