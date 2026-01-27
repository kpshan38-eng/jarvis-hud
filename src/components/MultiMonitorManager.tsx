import { useState, useCallback, useEffect } from "react";
import { Monitor, Layout, ExternalLink, X, Maximize2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PanelWindow {
  id: string;
  name: string;
  window: Window | null;
  enabled: boolean;
}

interface MultiMonitorManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MultiMonitorManager = ({ isOpen, onClose }: MultiMonitorManagerProps) => {
  const [panels, setPanels] = useState<PanelWindow[]>([
    { id: "weather", name: "Weather Panel", window: null, enabled: false },
    { id: "stocks", name: "Stock Ticker", window: null, enabled: false },
    { id: "calendar", name: "Calendar Widget", window: null, enabled: false },
    { id: "worldmap", name: "World Map", window: null, enabled: false },
    { id: "console", name: "Command Console", window: null, enabled: false },
    { id: "diagnostics", name: "Diagnostics", window: null, enabled: false },
  ]);

  const [isMultiMonitorActive, setIsMultiMonitorActive] = useState(false);

  const openPanelWindow = useCallback((panelId: string, panelName: string) => {
    const width = 600;
    const height = 400;
    const left = window.screenX + (window.outerWidth - width) / 2 + Math.random() * 100;
    const top = window.screenY + (window.outerHeight - height) / 2 + Math.random() * 100;

    const newWindow = window.open(
      "",
      `jarvis-${panelId}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );

    if (newWindow) {
      // Write the panel HTML to the new window
      const html = `
        <!DOCTYPE html>
        <html lang="en" class="dark">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>J.A.R.V.I.S. - ${panelName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Share Tech Mono', monospace;
              background: linear-gradient(135deg, #010812 0%, #001a2c 50%, #010812 100%);
              color: #00d4ff;
              min-height: 100vh;
              padding: 20px;
            }
            .container {
              border: 1px solid rgba(0, 212, 255, 0.3);
              background: rgba(0, 20, 40, 0.8);
              border-radius: 8px;
              padding: 20px;
              height: calc(100vh - 40px);
              position: relative;
              overflow: hidden;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid rgba(0, 212, 255, 0.2);
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .status {
              font-size: 10px;
              color: #00ff88;
              animation: pulse 2s ease-in-out infinite;
            }
            .content {
              font-size: 12px;
              color: rgba(0, 212, 255, 0.7);
            }
            .grid {
              position: absolute;
              inset: 0;
              opacity: 0.03;
              background-image: 
                linear-gradient(#00d4ff 1px, transparent 1px),
                linear-gradient(90deg, #00d4ff 1px, transparent 1px);
              background-size: 30px 30px;
              pointer-events: none;
            }
            .scanline {
              position: absolute;
              inset: 0;
              overflow: hidden;
              opacity: 0.03;
              pointer-events: none;
            }
            .scanline::before {
              content: '';
              position: absolute;
              width: 100%;
              height: 2px;
              background: linear-gradient(to right, transparent, #00d4ff, transparent);
              animation: scan 4s linear infinite;
            }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            @keyframes scan { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }
            .data-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid rgba(0, 212, 255, 0.1);
            }
            .data-label { color: rgba(0, 212, 255, 0.5); }
            .data-value { color: #00d4ff; }
            .chart {
              height: 100px;
              display: flex;
              align-items: flex-end;
              gap: 4px;
              margin-top: 20px;
            }
            .chart-bar {
              flex: 1;
              background: linear-gradient(to top, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.8));
              border-radius: 2px 2px 0 0;
              animation: grow 0.5s ease-out;
            }
            @keyframes grow { from { height: 0; } }
          </style>
        </head>
        <body>
          <div class="grid"></div>
          <div class="scanline"></div>
          <div class="container">
            <div class="header">
              <div class="title">${panelName}</div>
              <div class="status">● STREAMING</div>
            </div>
            <div class="content" id="content">
              <div class="data-row">
                <span class="data-label">STATUS</span>
                <span class="data-value">ACTIVE</span>
              </div>
              <div class="data-row">
                <span class="data-label">LINK</span>
                <span class="data-value">MAIN HUD</span>
              </div>
              <div class="data-row">
                <span class="data-label">LATENCY</span>
                <span class="data-value" id="latency">0ms</span>
              </div>
              <div class="data-row">
                <span class="data-label">REFRESH</span>
                <span class="data-value">60Hz</span>
              </div>
              <div class="chart" id="chart"></div>
            </div>
          </div>
          <script>
            // Update latency
            setInterval(() => {
              const latency = Math.floor(Math.random() * 10 + 1);
              document.getElementById('latency').textContent = latency + 'ms';
            }, 1000);
            
            // Build chart
            const chart = document.getElementById('chart');
            for (let i = 0; i < 20; i++) {
              const bar = document.createElement('div');
              bar.className = 'chart-bar';
              bar.style.height = (Math.random() * 80 + 20) + '%';
              bar.style.animationDelay = (i * 50) + 'ms';
              chart.appendChild(bar);
            }
            
            // Animate chart
            setInterval(() => {
              const bars = chart.querySelectorAll('.chart-bar');
              bars.forEach(bar => {
                bar.style.height = (Math.random() * 80 + 20) + '%';
              });
            }, 2000);
            
            // Handle close
            window.addEventListener('beforeunload', () => {
              window.opener?.postMessage({ type: 'JARVIS_PANEL_CLOSED', panelId: '${panelId}' }, '*');
            });
          </script>
        </body>
        </html>
      `;

      newWindow.document.write(html);
      newWindow.document.close();

      return newWindow;
    }

    return null;
  }, []);

  const closePanelWindow = useCallback((panelId: string) => {
    setPanels(prev => prev.map(p => {
      if (p.id === panelId && p.window) {
        p.window.close();
        return { ...p, window: null, enabled: false };
      }
      return p;
    }));
  }, []);

  const togglePanel = useCallback((panelId: string) => {
    setPanels(prev => prev.map(p => {
      if (p.id === panelId) {
        if (p.enabled && p.window) {
          p.window.close();
          return { ...p, window: null, enabled: false };
        } else {
          const newWindow = openPanelWindow(panelId, p.name);
          return { ...p, window: newWindow, enabled: !!newWindow };
        }
      }
      return p;
    }));
  }, [openPanelWindow]);

  // Listen for panel close messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "JARVIS_PANEL_CLOSED") {
        setPanels(prev => prev.map(p => 
          p.id === event.data.panelId ? { ...p, window: null, enabled: false } : p
        ));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Clean up windows on unmount
  useEffect(() => {
    return () => {
      panels.forEach(p => {
        if (p.window) p.window.close();
      });
    };
  }, []);

  const openAllPanels = () => {
    panels.forEach(p => {
      if (!p.enabled) {
        togglePanel(p.id);
      }
    });
    setIsMultiMonitorActive(true);
  };

  const closeAllPanels = () => {
    panels.forEach(p => {
      if (p.enabled) {
        closePanelWindow(p.id);
      }
    });
    setIsMultiMonitorActive(false);
  };

  const activePanelCount = panels.filter(p => p.enabled).length;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-card/95 border-border backdrop-blur-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-primary jarvis-glow flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Multi-Monitor Layout
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Spread HUD panels across multiple windows
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-background/50 rounded border border-border/50">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-primary" />
              <span className="text-sm">Active Panels</span>
            </div>
            <span className="text-primary font-mono">{activePanelCount} / {panels.length}</span>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={openAllPanels}
              className="flex-1 py-2 px-3 bg-primary/10 border border-primary/30 rounded text-primary text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              Open All
            </button>
            <button
              onClick={closeAllPanels}
              className="flex-1 py-2 px-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Close All
            </button>
          </div>

          {/* Panel List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">Available Panels</h3>
            {panels.map(panel => (
              <div 
                key={panel.id}
                className="flex items-center justify-between p-3 bg-background/30 rounded border border-border/30 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${panel.enabled ? "bg-green-500" : "bg-muted"}`} />
                  <span className="text-sm">{panel.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {panel.enabled && (
                    <button
                      onClick={() => panel.window?.focus()}
                      className="p-1 hover:bg-primary/10 rounded"
                      title="Focus window"
                    >
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </button>
                  )}
                  <Switch
                    checked={panel.enabled}
                    onCheckedChange={() => togglePanel(panel.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-500/80">
            <p>
              <strong>Note:</strong> Pop-up blockers may prevent windows from opening. 
              Please allow pop-ups for this site to use multi-monitor mode.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MultiMonitorManager;
