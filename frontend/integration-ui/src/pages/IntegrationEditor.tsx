import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import EditRequestModal from "@/components/EditRequestModal";
import type { Integration, ApiRequest } from "@/types/integration";
import { Pencil, Trash2, ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

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

    const updated = {
      ...integration,
      requests: [...integration.requests, newRequest],
    };

    setIntegration(updated);
    setEditingRequest(newRequest);
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
      const response = await api.post(`/integrations/${integration.id}/run`);
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

      <Button variant="outline" className="text-sm" onClick={handleAddRequest}>
        + Add Request
      </Button>

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

      <div className="flex items-center justify-between mt-4">
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
