import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import EditRequestModal from "@/components/EditRequestModal";
import type { Integration, ApiRequest } from "@/types/integration";
import { Pencil, Trash2, ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import KeyValueEditor from "@/components/KeyValueEditor";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function IntegrationEditor() {
  const { id } = useParams<{ id: string }>();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRequest, setEditingRequest] = useState<ApiRequest | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [runtimeModalOpen, setRuntimeModalOpen] = useState(false);
  const [runtimeValues, setRuntimeValues] = useState<[string, string][]>([]);

  const navigate = useNavigate();

  const handleEditRequest = (req: ApiRequest) => setEditingRequest(req);

  const handleSaveRequest = (updated: ApiRequest) => {
    setIntegration((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        requests: prev.requests.map((r) => (r.id === updated.id ? updated : r)),
      };
    });
    setUnsavedChanges(true);
    setSaveStatus("idle");
  };

  const handleDeleteRequest = (requestId: string) => {
    setIntegration((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        requests: prev.requests.filter((r) => r.id !== requestId),
      };
    });
    setUnsavedChanges(true);
    setSaveStatus("idle");
  };

  const handleAddRequest = () => {
    if (!integration) return;
    const newRequest: ApiRequest = {
      id: crypto.randomUUID(),
      name: "",
      method: "GET",
      url: "",
      headers: {},
      body: "",
      extractors: {},
    };
    setIntegration({
      ...integration,
      requests: [...integration.requests, newRequest],
    });
    setEditingRequest(newRequest);
    setUnsavedChanges(true);
    setSaveStatus("idle");
  };

  const handleSaveIntegration = async () => {
    if (!integration) return;
    setSaveStatus("saving");
    try {
      await api.put(`/integrations/${integration.id}`, integration);
      setSaveStatus("saved");
      setUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to save integration", err);
      setSaveStatus("error");
    }
  };

  const handleDeleteIntegration = async () => {
    if (!integration) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the integration "${integration.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/integrations/${integration.id}`);
      navigate("/"); // Go back to list after deletion
    } catch (err) {
      console.error("Failed to delete integration", err);
      alert("Failed to delete integration. See console for details.");
    }
  };

  const handleRunIntegration = async () => {
    if (!integration?.id) return;

    const runtimeMap = Object.fromEntries(
      runtimeValues.filter(([k]) => k.trim() !== "")
    );

    try {
      const response = await api.post(`/integrations/${integration.id}/run`, {
        values: runtimeMap,
      });
      console.log("Integration run result:", response.data);
    } catch (error) {
      console.error("Error running integration:", error);
    }
  };

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

  const sensors = useSensors(useSensor(PointerSensor));

  if (loading)
    return <p className="p-4 text-gray-500">Loading integration...</p>;
  if (!integration)
    return <p className="p-4 text-red-500">Integration not found.</p>;

  return (
    <div className="p-6 space-y-6">
      {editingRequest && (
        <EditRequestModal
          open={true}
          onClose={() => setEditingRequest(null)}
          request={editingRequest}
          onSave={handleSaveRequest}
        />
      )}

      {runtimeModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg space-y-4">
            <h2 className="text-lg font-semibold text-zinc-800">
              Runtime Values
            </h2>
            <KeyValueEditor
              label="Values"
              pairs={runtimeValues}
              onChange={setRuntimeValues}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                className="border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                onClick={() => setRuntimeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => setRuntimeModalOpen(false)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="cursor-pointer mb-4 flex items-center gap-2 rounded px-3 py-2 text-sm text-zinc-600 bg-transparent hover:text-indigo-600 hover:bg-zinc-100 transition"
      >
        <ArrowLeft size={16} />
        Back to Integrations
      </button>

      <div className="flex items-center gap-2">
        <Input
          className="text-2xl font-bold text-indigo-600 border-none focus:ring-0 focus:outline-none w-auto"
          value={integration.name}
          onChange={(e) =>
            setIntegration((prev) => prev && { ...prev, name: e.target.value })
          }
        />
        <span className="text-zinc-400 text-sm">← click to rename</span>
      </div>

      <div className="flex-col space-y-1">
        {/* Save status */}
        <div className="text-sm text-zinc-600">
          {unsavedChanges && saveStatus === "idle" && (
            <span className="text-orange-500">Unsaved changes</span>
          )}
          {saveStatus === "saving" && (
            <span className="text-blue-500">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-green-600">All changes saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-500">Save failed</span>
          )}
        </div>

        <Button
          className="bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={handleSaveIntegration}
          disabled={saveStatus === "saving"}
        >
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "✅ Saved"}
          {saveStatus === "error" && "❌ Retry Save"}
          {saveStatus === "idle" && "Save Integration"}
        </Button>
      </div>

      {integration.requests.length === 0 ? (
        <div className="border border-dashed rounded-md p-6 text-center text-zinc-500 bg-zinc-50">
          <p className="text-lg font-semibold text-zinc-600">No requests yet</p>
          <p className="text-sm text-zinc-500 mt-1">
            Start by adding your first request using the button above.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (active.id !== over?.id && integration) {
              const oldIndex = integration.requests.findIndex(
                (r) => r.id === active.id
              );
              const newIndex = integration.requests.findIndex(
                (r) => r.id === over?.id
              );
              const reordered = arrayMove(
                integration.requests,
                oldIndex,
                newIndex
              );
              setIntegration({ ...integration, requests: reordered });
              setUnsavedChanges(true);
              setSaveStatus("idle");
            }
          }}
        >
          <SortableContext
            items={integration.requests.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            {integration.requests.map((req) => (
              <SortableRequestCard
                key={req.id}
                request={req}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center justify-between mt-4">
        <Button
          className="border border-zinc-300 text-zinc-700 hover:bg-zinc-100 px-4 py-2 rounded-md text-sm cursor-pointer transition"
          onClick={handleAddRequest}
        >
          + Add Request
        </Button>

        <Button
          onClick={() => setRuntimeModalOpen(true)}
          className="border border-zinc-300 text-zinc-700 hover:bg-zinc-100 px-4 py-2 rounded-md text-sm cursor-pointer transition"
        >
          Provide Runtime Values
        </Button>

        <Button
          className="cursor-pointer bg-green-600 text-white hover:bg-green-700 font-semibold px-5 py-2 flex items-center gap-2"
          onClick={handleRunIntegration}
        >
          <Play size={16} />
          Run Integration
        </Button>
      </div>

      <div className="mt-10 border-t pt-6 border-red-200">
        <h2 className="text-red-600 text-lg font-semibold">Danger Zone</h2>
        <p className="text-sm text-red-500 mt-1">
          Deleting this integration is permanent and cannot be undone.
        </p>
        <Button
          onClick={handleDeleteIntegration}
          className="cursor-pointer mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
        >
          Delete Integration
        </Button>
      </div>
    </div>
  );
}

function SortableRequestCard({
  request,
  onEdit,
  onDelete,
}: {
  request: ApiRequest;
  onEdit: (r: ApiRequest) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-md shadow hover:shadow-lg transition bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <div
          className="pr-2 cursor-grab text-zinc-400 hover:text-zinc-600"
          {...attributes}
          {...listeners}
        >
          &#x2630;
        </div>
        <div onClick={() => onEdit(request)} className="flex-1 cursor-pointer">
          <span className="text-xs font-semibold text-indigo-600 block">
            {request.method}
          </span>
          <span className="text-sm truncate text-gray-800 font-medium">
            {request.name?.trim() || request.url || "Untitled Request"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-1 rounded hover:bg-indigo-50"
            onClick={() => onEdit(request)}
          >
            <Pencil size={20} className="text-zinc-600 hover:text-indigo-600" />
          </button>
          <button
            className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
            onClick={() => onDelete(request.id)}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
