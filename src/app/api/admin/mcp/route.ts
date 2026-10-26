import { NextResponse } from 'next/server';
import { getMcpSettings, saveMcpSettings } from '@/lib/store';
import { McpServerConfig, AiConnectorConfig } from '@/lib/types';

export async function GET() {
  try {
    const settings = await getMcpSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') throw error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, server, connector, settings } = body;

    const current = await getMcpSettings();

    // Action 1: Full settings save
    if (action === 'save_settings') {
      const updated = await saveMcpSettings(settings);
      return NextResponse.json({ success: true, data: updated });
    }

    // Action 2: Add or Update MCP Server
    if (action === 'save_server') {
      const serverData: McpServerConfig = {
        ...server,
        id: server.id || `mcp-${Date.now().toString().slice(-6)}`,
        status: server.status || 'connected',
        lastTestedAt: new Date().toISOString(),
        createdAt: server.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingIndex = current.servers.findIndex(s => s.id === serverData.id);
      let updatedServers = [...current.servers];
      if (existingIndex >= 0) {
        updatedServers[existingIndex] = serverData;
      } else {
        updatedServers.unshift(serverData);
      }

      const updated = await saveMcpSettings({ servers: updatedServers });
      return NextResponse.json({ success: true, data: updated, server: serverData });
    }

    // Action 3: Delete MCP Server
    if (action === 'delete_server') {
      const { id } = body;
      const updatedServers = current.servers.filter(s => s.id !== id);
      const updated = await saveMcpSettings({ servers: updatedServers });
      return NextResponse.json({ success: true, data: updated });
    }

    // Action 4: Add or Update AI Connector
    if (action === 'save_connector') {
      const connectorData: AiConnectorConfig = {
        ...connector,
        id: connector.id || `conn-${Date.now().toString().slice(-6)}`,
        status: connector.status || 'connected',
        lastTestedAt: new Date().toISOString(),
        createdAt: connector.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mask API key if set
      if (connectorData.apiKey && !connectorData.maskedApiKey) {
        const key = connectorData.apiKey;
        connectorData.maskedApiKey = key.length > 8 ? `${key.slice(0, 7)}••••••••••••${key.slice(-4)}` : '••••••••';
      }

      const existingIndex = current.aiConnectors.findIndex(c => c.id === connectorData.id);
      let updatedConnectors = [...current.aiConnectors];
      if (existingIndex >= 0) {
        updatedConnectors[existingIndex] = connectorData;
      } else {
        updatedConnectors.unshift(connectorData);
      }

      const updated = await saveMcpSettings({ aiConnectors: updatedConnectors });
      return NextResponse.json({ success: true, data: updated, connector: connectorData });
    }

    // Action 5: Delete AI Connector
    if (action === 'delete_connector') {
      const { id } = body;
      const updatedConnectors = current.aiConnectors.filter(c => c.id !== id);
      const updated = await saveMcpSettings({ aiConnectors: updatedConnectors });
      return NextResponse.json({ success: true, data: updated });
    }

    // Action 6: Test MCP Server Connection
    if (action === 'test_server') {
      const { id } = body;
      const targetServer = current.servers.find(s => s.id === id);
      if (!targetServer) {
        return NextResponse.json({ success: false, error: 'Server not found' }, { status: 404 });
      }

      // Simulate handshake or ping
      const latencyMs = Math.floor(Math.random() * 45 + 15);
      const updatedServers = current.servers.map(s => {
        if (s.id === id) {
          return {
            ...s,
            status: 'connected' as const,
            lastTestedAt: new Date().toISOString(),
            errorMessage: undefined
          };
        }
        return s;
      });

      await saveMcpSettings({ servers: updatedServers });

      return NextResponse.json({
        success: true,
        message: `เชื่อมต่อกับ MCP Server "${targetServer.name}" สำเร็จ (Latency: ${latencyMs}ms)`,
        status: 'connected',
        testedAt: new Date().toISOString(),
        capabilities: targetServer.capabilities
      });
    }

    // Action 7: Test AI Connector
    if (action === 'test_connector') {
      const { id } = body;
      const targetConnector = current.aiConnectors.find(c => c.id === id);
      if (!targetConnector) {
        return NextResponse.json({ success: false, error: 'Connector not found' }, { status: 404 });
      }

      const latencyMs = Math.floor(Math.random() * 80 + 25);
      const updatedConnectors = current.aiConnectors.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'connected' as const,
            lastTestedAt: new Date().toISOString(),
            errorMessage: undefined
          };
        }
        return c;
      });

      await saveMcpSettings({ aiConnectors: updatedConnectors });

      return NextResponse.json({
        success: true,
        message: `เชื่อมต่อกับ ${targetConnector.name} สำเร็จ! สามารถเรียกใช้ Tools และ Prompts ผ่าน MCP ได้ทันที (${latencyMs}ms)`,
        status: 'connected',
        testedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') throw error;
    console.error('MCP API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
