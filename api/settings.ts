import { DatabaseService } from '../src/core/database/db.service';
import { LlmFactory } from '../src/core/llm/llm.factory';
import { LoggerService } from '../src/core/observability/logger.service';

function sendJson(res: any, status: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

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
    res.statusCode = 200;
    return res.end();
  }

  const db = DatabaseService.getInstance();
  const logger = LoggerService.getInstance();

  if (req.method === 'GET') {
    try {
      const settings = db.getSettings();
      return sendJson(res, 200, { success: true, settings });
    } catch (err: any) {
      console.error('Settings GET error:', err);
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to retrieve settings' });
    }
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      body = body || {};

      const { aiProvider, geminiApiKey, ollamaBaseUrl, ollamaModel } = body;

      if (aiProvider && !['mock', 'gemini', 'ollama'].includes(aiProvider)) {
        return sendJson(res, 400, {
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
      return sendJson(res, 200, { success: true, settings: updated });
    } catch (err: any) {
      console.error('Settings POST error:', err);
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to save settings' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
