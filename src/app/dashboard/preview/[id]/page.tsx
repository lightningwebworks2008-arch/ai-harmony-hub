'use client';

import { useEffect, useState } from 'react';
import { getSpec } from '@/app/lib/dashboard-tools/specStore';
import { DashboardRenderer } from '@/app/components/DashboardRenderer';
import { DashboardSpecification } from '@/app/lib/dashboard-tools/types';

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const [spec, setSpec] = useState<DashboardSpecification | null>(null);
  const [deviceView, setDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpec() {
      const resolvedParams = await params;
      const fetchedSpec = await getSpec(resolvedParams.id);
      
      if (fetchedSpec) {
        setSpec({
          templateId: fetchedSpec.templateId,
          templateName: fetchedSpec.templateName,
          structure: fetchedSpec.structure,
          fieldMappings: fetchedSpec.fieldMappings,
          theme: fetchedSpec.theme
        });
      }
      setLoading(false);
    }
    loadSpec();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading preview...</div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Dashboard not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dashboard Preview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {spec.templateName}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    deviceView === 'mobile'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  📱 Mobile
                </button>
                <button
                  onClick={() => setDeviceView('tablet')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    deviceView === 'tablet'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  📱 Tablet
                </button>
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    deviceView === 'desktop'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  🖥️ Desktop
                </button>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  Edit
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                  Deploy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardRenderer spec={spec} deviceView={deviceView} />
    </div>
  );
}
