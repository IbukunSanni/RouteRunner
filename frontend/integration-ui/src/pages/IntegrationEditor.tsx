import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/client";
import EditRequestModal from "@/components/EditRequestModal";
import type { Integration, ApiRequest } from "@/types/integration";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Play } from "lucide-react";

export default function IntegrationEditor() {
  const { id } = useParams<{ id: string }>();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRequest, setEditingRequest] = useState<ApiRequest | null>(null);
  const navigate = useNavigate();

  const handleAddRequest = () => {
    if (!integration) return;

    const newRequest: ApiRequest = {
      id: crypto.randomUUID(), // or use uuid library
      name: "",
      method: "GET",
      url: "",
      headers: {},
      body: "",
      extractors: {},
    };

    const updated = {
      ...integration,
      requests: [...integration.requests, newRequest],
    };

    setIntegration(updated);
    setEditingRequest(newRequest); // open modal immediately
  };

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

  const handleRunIntegration = async () => {
    if (!integration?.id) return;

    try {
      console.log("Running integration...");

      const response = await api.post(`/integrations/${integration.id}/run`);

      // You might show results or status here
      console.log("Integration run result:", response.data);

      // Optional: show success toast, modal, or mark status in UI
    } catch (error) {
      console.error("Error running integration:", error);
      // Optional: show error message to user
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
                <strong>
                  {req.name?.trim() || req.url || "Untitled Request"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Edit Button */}
              <button
                className="p-1 rounded hover:bg-indigo-50 active:bg-indigo-100 transition cursor-pointer"
                onClick={() => handleEditRequest(req)}
              >
                <Pencil
                  size={20}
                  className="text-zinc-600 hover:text-indigo-600 transition"
                />
              </button>

              {/* Delete Button */}
              <button
                className="bg-red-500 text-white p-1 rounded hover:bg-red-600 active:bg-red-700 transition cursor-pointer"
                onClick={() => handleDeleteRequest(req.id)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between mt-4">
        {/* Left buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="text-sm"
            onClick={handleAddRequest}
          >
            + Add Request
          </Button>

          <Button
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={handleSaveIntegration}
          >
            Save Integration
          </Button>
        </div>

        {/* Right button */}
        <Button
          className="cursor-pointer bg-green-600 text-white hover:bg-green-700 font-semibold px-5 py-2 flex items-center gap-2"
          onClick={handleRunIntegration}
        >
          <Play size={16} />
          Run Integration
        </Button>
      </div>
    </div>
  );
}
