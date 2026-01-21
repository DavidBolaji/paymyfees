import { SupportController } from '@/src/controllers/SupportController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const supportController = new SupportController();

/**
 * GET /api/support/faqs
 * Get frequently asked questions
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for FAQs
  await lenientRateLimiter(req);

  // Delegate to controller
  return await supportController.getFaqs(req);
});