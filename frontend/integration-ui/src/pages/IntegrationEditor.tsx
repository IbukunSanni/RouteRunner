import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/client";
import EditRequestModal from "@/components/EditRequestModal";
import type { Integration, ApiRequest } from '@/types/integration';

export default function IntegrationEditor() {
  const { id } = useParams<{ id: string }>();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRequest, setEditingRequest] = useState<ApiRequest | null>(null);

  // Open modal with selected request
  const handleEditRequest = (req: ApiRequest) => setEditingRequest(req);

  // Update the request inside the integration
  const handleSaveRequest = (updated: ApiRequest) => {
    setIntegration((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        requests: prev.requests.map((r) =>
          r.id === updated.id ? updated : r
        ),
      };
    });
  };

  // Load integration from backend
  useEffect(() => {
    if (!id) return;
    api
      .get(`/integrations/${id}`)
      .then((res) => {
        setIntegration(res.data);
      })
      .catch((err) => console.error("Failed to load integration", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <p className="p-4 text-gray-500">Loading integration...</p>;
  if (!integration)
    return <p className="p-4 text-red-500">Integration not found.</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Edit modal for a selected request */}
      {editingRequest && (
        <EditRequestModal
          open={true}
          onClose={() => setEditingRequest(null)}
          request={editingRequest}
          onSave={handleSaveRequest}
        />
      )}

      <h1 className="text-3xl font-bold text-indigo-600">
        Editing Integration: {integration.name}
      </h1>

      {integration.requests.map((req) => (
        <div
          key={req.id}
          onClick={() => handleEditRequest(req)}
          className="border rounded-md shadow hover:shadow-md transition bg-white p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600">
              {req.method}
            </span>
            <span className="text-sm truncate text-gray-800">
              {req.url || "[No URL]"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
