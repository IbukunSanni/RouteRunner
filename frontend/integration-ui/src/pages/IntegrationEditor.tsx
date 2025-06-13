import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/api/client';

interface ApiRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string | null;
  extractors?: Record<string, string>;
}

interface Integration {
  id: string;
  name: string;
  requests: ApiRequest[];
}

export default function IntegrationEditor() {
  const { id } = useParams<{ id: string }>();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/integrations/${id}`)
      .then((res) => setIntegration(res.data))
      .catch((err) => console.error('Failed to load integration', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-4 text-gray-500">Loading integration...</p>;
  if (!integration) return <p className="p-4 text-red-500">Integration not found.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-600">Editing Integration: {integration.name}</h1>

      {integration.requests.map((req, index) => (
        <div key={req.id} className="border p-4 rounded-md shadow-sm bg-white space-y-2">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">Step {index + 1}</span>
            <input
              type="text"
              value={req.method}
              className="w-20 border rounded px-2 py-1 text-sm uppercase"
              readOnly
            />
            <input
              type="text"
              value={req.url}
              className="flex-1 border rounded px-2 py-1 text-sm"
              readOnly
            />
          </div>
          {req.body && (
            <textarea
              value={req.body}
              className="w-full mt-2 text-sm p-2 border rounded bg-gray-50"
              rows={4}
              readOnly
            />
          )}
        </div>
      ))}
    </div>
  );
}
