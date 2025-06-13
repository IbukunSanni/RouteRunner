/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  const [activeTabs, setActiveTabs] = useState<Record<string, 'headers' | 'body' | 'extractors'>>({});

  useEffect(() => {
    if (!id) return;
    api.get(`/integrations/${id}`)
      .then((res) => {
        setIntegration(res.data);
        const initialTabs: Record<string, 'headers' | 'body' | 'extractors'> = {};
        res.data.requests.forEach((r: ApiRequest) => {
          initialTabs[r.id] = 'headers';
        });
        setActiveTabs(initialTabs);
      })
      .catch((err) => console.error('Failed to load integration', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-4 text-gray-500">Loading integration...</p>;
  if (!integration) return <p className="p-4 text-red-500">Integration not found.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-600">Editing Integration: {integration.name}</h1>

      {integration.requests.map((req, index) => {
        const activeTab = activeTabs[req.id] || 'headers';

        return (
          <div key={req.id} className="border p-4 rounded-md shadow bg-white space-y-4">
            <div className="flex gap-2 items-center">
              <select
                value={req.method}
                className="border rounded px-2 py-1 text-sm"
                disabled
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              <Input
                value={req.url}
                readOnly
                className="flex-1 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={activeTab === 'headers' ? 'default' : 'outline'}
                onClick={() =>
                  setActiveTabs((prev) => ({ ...prev, [req.id]: 'headers' }))
                }
              >
                Headers
              </Button>
              <Button
                variant={activeTab === 'body' ? 'default' : 'outline'}
                onClick={() =>
                  setActiveTabs((prev) => ({ ...prev, [req.id]: 'body' }))
                }
              >
                Body
              </Button>
              <Button
                variant={activeTab === 'extractors' ? 'default' : 'outline'}
                onClick={() =>
                  setActiveTabs((prev) => ({ ...prev, [req.id]: 'extractors' }))
                }
              >
                Extractors
              </Button>
            </div>

            {activeTab === 'headers' && (
              <div className="space-y-2">
                {Object.entries(req.headers).map(([key, value], i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={key} readOnly className="w-1/3" />
                    <Input value={value} readOnly className="w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'body' && (
              <Textarea
                value={req.body ?? ''}
                readOnly
                rows={5}
                className="w-full"
              />
            )}

            {activeTab === 'extractors' && req.extractors && (
              <div className="space-y-2">
                {Object.entries(req.extractors).map(([key, path], i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={key} readOnly className="w-1/3" />
                    <Input value={path} readOnly className="w-2/3" />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
