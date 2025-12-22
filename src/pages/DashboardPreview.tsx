import { useParams } from 'react-router-dom';

export default function DashboardPreview() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Preview</h1>
      <p className="text-muted-foreground">Preview ID: {id}</p>
      <p className="text-sm text-muted-foreground mt-4">
        Dashboard rendering will be implemented after Edge Function setup
      </p>
    </div>
  );
}
