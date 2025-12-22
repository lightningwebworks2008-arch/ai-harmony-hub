import { createClient } from '@supabase/supabase-js';

interface DashboardSpec {
  templateId: string;
  templateName: string;
  structure: {
    sections: Array<{
      type: string;
      title?: string;
      widgets: Array<{
        type?: string;
        label?: string;
        title?: string;
        icon?: string;
        dataPath?: string;
        height?: Record<string, string>;
      }>;
      columns?: Array<{ key: string; label: string }>;
      responsive?: Record<string, string>;
    }>;
  };
  fieldMappings: Record<string, string>;
  theme: {
    primary: string;
    secondary?: string;
    background?: string;
  };
  sampleData?: Record<string, unknown>;
  createdAt?: number;
}

const supabaseUrl = "https://ptzuijpjmqogcvigvklv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0enVpanBqbXFvZ2N2aWd2a2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODExMDQsImV4cCI6MjA4MTk1NzEwNH0.SPBb2JdSkgWF5npR_E-K0FshikeCpYk5CWL6PhQUKzs";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveSpec(id: string, spec: DashboardSpec): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await supabase
    .from('dashboard_specs')
    .upsert({
      id,
      spec,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    });
}

export async function getSpec(id: string): Promise<DashboardSpec | null> {
  const { data, error } = await supabase
    .from('dashboard_specs')
    .select('spec')
    .eq('id', id)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.spec as DashboardSpec;
}

export async function deleteSpec(id: string): Promise<void> {
  await supabase
    .from('dashboard_specs')
    .delete()
    .eq('id', id);
}

export async function listSpecs(): Promise<Array<{ id: string; spec: DashboardSpec }>> {
  const { data, error } = await supabase
    .from('dashboard_specs')
    .select('id, spec')
    .gt('expires_at', new Date().toISOString());

  if (error || !data) {
    return [];
  }

  return data.map(row => ({
    id: row.id,
    spec: row.spec as DashboardSpec
  }));
}

export type { DashboardSpec };
