// This would be the entry point for your Appwrite function.
// It assumes you have a similar folder structure:
// /appwrite/manage-subscription/src/index.ts

// Basic, simplified types to satisfy the linter locally.
// The actual types are provided by the Appwrite runtime.
interface AppwriteRequest {
  body: string;
}

interface AppwriteResponse {
  json: (data: Record<string, unknown>, statusCode?: number) => void;
  redirect: (url: string, statusCode?: number) => void;
}

interface AppwriteContext {
  req: AppwriteRequest;
  res: AppwriteResponse;
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export default async function (context: AppwriteContext): Promise<void> {
  try {
    const { userId, planId } = JSON.parse(context.req.body || '{}');
    const REVENUECAT_APP_ID = process.env.REVENUECAT_APP_ID;
    const RETURN_URL = process.env.APP_URL || 'http://localhost:5173/settings/billing';

    if (!userId) {
      context.res.json({ success: false, error: 'User ID is required' }, 400);
      return;
    }

    if (!REVENUECAT_APP_ID) {
      context.error('REVENUECAT_APP_ID is not configured in environment variables.');
      context.res.json({ success: false, error: 'Billing service is not configured.' }, 500);
      return;
    }
    
    // Construct the RevenueCat customer portal URL
    const portalUrl = new URL(`https://app.revenuecat.com/p/${REVENUECAT_APP_ID}/subscribe`);
    portalUrl.searchParams.append('app_user_id', userId);
    portalUrl.searchParams.append('redirect_uri', RETURN_URL);
    
    if (planId) {
      portalUrl.searchParams.append('plan_id', planId);
    }

    context.log(`Redirecting user ${userId} to RevenueCat portal.`);
    
    // Redirect the user to the portal
    context.res.redirect(portalUrl.toString(), 303);
  } catch (e) {
    const error = e as Error;
    context.error('Failed to process subscription management request:', error.message);
    context.res.json({ success: false, error: 'Bad Request. Invalid JSON in body.' }, 400);
  }
} 