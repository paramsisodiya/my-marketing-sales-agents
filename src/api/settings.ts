import { DatabaseService } from '../core/database/db.service';
import { LlmFactory } from '../core/llm/llm.factory';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const db = DatabaseService.getInstance();

  if (req.method === 'GET') {
    try {
      const settings = db.getSettings();
      return sendJson(res, 200, { success: true, settings });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to retrieve settings' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { aiProvider, geminiApiKey, ollamaBaseUrl, ollamaModel } = body;

      if (aiProvider && !['mock', 'gemini', 'ollama'].includes(aiProvider)) {
        return sendJson(res, 400, {
          success: false,
          error: `Invalid AI Provider: ${aiProvider}. Supported providers: mock, gemini, ollama.`,
        });
      }

      const updatedSettings = db.updateSettings({
        aiProvider: aiProvider as any,
        geminiApiKey,
        ollamaBaseUrl,
        ollamaModel,
      });

      LlmFactory.resetInstance();

      return sendJson(res, 200, {
        success: true,
        message: 'Settings updated successfully',
        settings: updatedSettings,
      });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to update settings' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
