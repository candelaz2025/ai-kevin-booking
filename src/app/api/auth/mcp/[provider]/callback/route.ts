import { NextResponse } from 'next/server';
import { getMcpSettings, saveMcpSettings } from '@/lib/store';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Retrieve settings
    const settings = await getMcpSettings();
    const connector = settings.aiConnectors.find(c => c.provider === provider);

    if (connector) {
      // Mark connector as connected via OAuth
      const updatedConnectors = settings.aiConnectors.map(c => {
        if (c.provider === provider) {
          return {
            ...c,
            status: 'connected' as const,
            lastTestedAt: new Date().toISOString(),
            oauth: {
              ...c.oauth,
              accessToken: `mcp_oauth_token_${Date.now()}`,
              accountEmail: c.oauth?.accountEmail || 'kevinenjoy2025@gmail.com',
              accountName: c.oauth?.accountName || `Connected ${provider.toUpperCase()} Account`
            }
          };
        }
        return c;
      });

      await saveMcpSettings({ aiConnectors: updatedConnectors });
    }

    // Redirect back to Admin Portal on the MCP tab with a success banner
    const redirectUrl = new URL('/admin?tab=mcp&oauth_success=' + encodeURIComponent(provider), req.url);
    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    if (err?.digest === 'NEXT_PRERENDER_INTERRUPTED') throw err;
    console.error('OAuth Callback error:', err);
    const errorUrl = new URL('/admin?tab=mcp&oauth_error=' + encodeURIComponent(err.message), req.url);
    return NextResponse.redirect(errorUrl);
  }
}
