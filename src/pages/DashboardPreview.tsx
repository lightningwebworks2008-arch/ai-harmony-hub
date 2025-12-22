import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSpec, DashboardSpec } from '@/lib/specStore';
import { DashboardRenderer } from '@/components/DashboardRenderer';

export default function DashboardPreview() {
  const { id } = useParams<{ id: string }>();
  const [spec, setSpec] = useState<DashboardSpec | null>(null);
  const [deviceView, setDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpec() {
      if (!id) {
        setLoading(false);
        return;
      }
      const fetchedSpec = await getSpec(id);
      setSpec(fetchedSpec);
      setLoading(false);
    }
    loadSpec();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading preview...</div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Dashboard not found</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className={`border-b border-border bg-card sticky top-0 z-10 ${isFullscreen ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Dashboard Preview
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {spec.templateName}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <label className="px-2 text-sm font-medium text-muted-foreground">
                  Device:
                </label>
                <select
                  value={deviceView === 'desktop' ? 'Current' : deviceView}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'Current') {
                      setDeviceView('desktop');
                    } else {
                      setDeviceView(value as 'mobile' | 'tablet');
                    }
                  }}
                  className="px-3 py-1.5 text-sm font-medium bg-card text-foreground border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="Current">Current</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>
                
                <button
                  onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
                  className="px-3 py-1.5 text-sm font-medium bg-card text-foreground border border-border rounded-md hover:bg-muted transition-colors"
                  title="Toggle orientation"
                >
                  🔄
                </button>
                
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="px-3 py-1.5 text-sm font-medium bg-card text-foreground border border-border rounded-md hover:bg-muted transition-colors"
                  title="Toggle fullscreen"
                >
                  ⛶
                </button>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-md hover:bg-muted">
                  Edit
                </button>
                <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md">
                  Deploy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardRenderer spec={spec} deviceView={deviceView} orientation={orientation} />
    </div>
  );
}
