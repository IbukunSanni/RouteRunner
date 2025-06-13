import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button'; // Shadcn
import { Card, CardContent } from '@/components/ui/card'; // Shadcn

interface Integration {
  id: string;
  name: string;
}

export default function IntegrationList() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/integrations')
      .then(res => setIntegrations(res.data))
      .catch(err => console.error('Failed to fetch integrations', err))
      .finally(() => setLoading(false));
  }, []);

  const createNewIntegration = async () => {
    const res = await api.post('/integrations', {
      name: 'Untitled Integration',
      requests: [],
    });
    navigate(`/integrations/${res.data.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Your Integrations</h1>
        <Button onClick={createNewIntegration}>+ New Integration</Button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {integrations.map(integration => (
          <Card
            key={integration.id}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/integrations/${integration.id}`)}
          >
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">{integration.name}</h2>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
