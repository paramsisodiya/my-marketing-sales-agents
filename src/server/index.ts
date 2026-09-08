import app from './app';
import { LoggerService } from '../core/observability/logger.service';
import { LlmFactory } from '../core/llm/llm.factory';

const logger = LoggerService.getInstance();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`PrimeSoul AI Server running on http://localhost:${PORT}`);
  console.log(`\n🚀 PrimeSoul AI Operating System active at http://localhost:${PORT}`);
  console.log(`🤖 AI Provider: ${LlmFactory.getCurrentProviderType().toUpperCase()}`);
});
