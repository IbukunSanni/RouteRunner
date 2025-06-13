import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/client";
import EditRequestModal from "@/components/EditRequestModal";
import type { Integration, ApiRequest } from "@/types/integration";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function IntegrationEditor() {
  const { id } = useParams<{ id: string }>();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRequest, setEditingRequest] = useState<ApiRequest | null>(null);
  const navigate = useNavigate();

  // Open modal with selected request
  const handleEditRequest = (req: ApiRequest) => setEditingRequest(req);

  // Update the request inside the integration
  const handleSaveRequest = (updated: ApiRequest) => {
    setIntegration((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        requests: prev.requests.map((r) => (r.id === updated.id ? updated : r)),
      };
    });
  };

  const handleDeleteRequest = (requestId: string) => {
    setIntegration((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        requests: prev.requests.filter((r) => r.id !== requestId),
      };
    });
  };

  const handleSaveIntegration = async () => {
    if (!integration) return;

    try {
      await api.put(`/integrations/${integration.id}`, integration);
      alert("Integration saved successfully!");
    } catch (err) {
      console.error("Failed to save integration", err);
      alert("Failed to save integration. See console.");
    }
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
      <button
        onClick={() => navigate("/")}
        className="cursor-pointer mb-4 flex items-center gap-2 rounded px-3 py-2 text-sm text-zinc-600 bg-transparent hover:text-indigo-600 hover:bg-zinc-100 transition"
      >
        <ArrowLeft size={16} />
        Back to Integrations
      </button>

      <h1 className="text-3xl font-bold text-indigo-600">
        Editing Integration: {integration.name}
      </h1>

      {integration.requests.map((req) => (
        <div
          key={req.id}
          className="border rounded-md shadow hover:shadow-lg transition bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleEditRequest(req)}
              className="cursor-pointer"
            >
              <span className="text-xs font-semibold text-indigo-600 block">
                {req.method}
              </span>
              <span className="text-sm truncate text-gray-800">
                {req.url || "[No URL]"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="hover:text-indigo-600"
                onClick={() => handleEditRequest(req)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                onClick={() => handleDeleteRequest(req.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <Button
        className="bg-indigo-600 text-white hover:bg-indigo-700"
        onClick={handleSaveIntegration}
      >
        Save Integration
      </Button>
    </div>
  );
}
