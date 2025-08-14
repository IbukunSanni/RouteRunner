import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import EditRequestModal from "@/components/EditRequestModal";
import type { Integration, ApiRequest, RunResult } from "@/types/integration";
import { Pencil, Trash2, Play } from "lucide-react";
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
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<RunResult[] | null>(null);

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
    setIsRunning(true);
    setRunResults(null); // Clear previous results

    // Convert runtime key-value pairs to object
    const valuesObject = Object.fromEntries(
      runtimeValues.filter(([k]) => k.trim() !== "")
    );

    try {
      const res = await api.post(`/integrations/${integration.id}/run`, {
        values: valuesObject, // ✅ Send runtime values to backend
      });

      setRunResults(res.data); // ✅ Save response (array of RunResult objects)
    } catch (err) {
      console.error("Failed to run integration", err);
      alert("Integration run failed. See console.");
    } finally {
      setIsRunning(false); // ✅ Re-enable run button
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
    <div className="space-y-8">
      {editingRequest && (
        <EditRequestModal
          open={true}
          onClose={() => setEditingRequest(null)}
          request={editingRequest}
          onSave={handleSaveRequest}
        />
      )}

      {runtimeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border-0 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Runtime Values
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Set dynamic values for your integration run
              </p>
            </div>
            <KeyValueEditor
              label="Values"
              pairs={runtimeValues}
              onChange={setRuntimeValues}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setRuntimeModalOpen(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setRuntimeModalOpen(false)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg"
              >
                Save Values
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border-0 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <Input
              className="text-2xl font-bold text-gray-900 border-none focus:ring-0 focus:outline-none p-0 bg-transparent"
              value={integration.name}
              onChange={(e) => {
                setIntegration((prev) => prev && { ...prev, name: e.target.value });
                setUnsavedChanges(true);
                setSaveStatus("idle");
              }}
              placeholder="Integration Name"
            />
            <p className="text-sm text-gray-500 mt-1">
              Click to edit the integration name
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Save status */}
            <div className="text-sm">
              {unsavedChanges && saveStatus === "idle" && (
                <span className="flex items-center text-amber-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Unsaved changes
                </span>
              )}
              {saveStatus === "saving" && (
                <span className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  All changes saved
                </span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center text-red-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Save failed
                </span>
              )}
            </div>

            <Button
              onClick={handleSaveIntegration}
              disabled={saveStatus === "saving"}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "saved" && "✅ Saved"}
              {saveStatus === "error" && "❌ Retry Save"}
              {saveStatus === "idle" && "Save Integration"}
            </Button>
          </div>
        </div>
      </div>

      {integration.requests.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h3>
          <p className="text-gray-600 mb-6">
            Start building your integration by adding your first API request
          </p>
          <Button
            onClick={handleAddRequest}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg"
          >
            Add Your First Request
          </Button>
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

      <div className="bg-white rounded-xl shadow-lg border-0 p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddRequest}
              variant="outline"
              className="border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              + Add Request
            </Button>

            <Button
              onClick={() => setRuntimeModalOpen(true)}
              variant="outline"
              className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Runtime Values
            </Button>
          </div>

          <Button
            onClick={handleRunIntegration}
            disabled={isRunning || (integration?.requests.length ?? 0) === 0}
            className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
              isRunning || (integration?.requests.length ?? 0) === 0
                ? "opacity-50 cursor-not-allowed"
                : "transform hover:scale-105"
            }`}
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running...
              </>
            ) : (
              <>
                <Play size={16} />
                Run Integration
              </>
            )}
          </Button>
        </div>
      </div>

      {runResults && (
        <div className="bg-white rounded-xl shadow-lg border-0 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Integration Results
              </h2>
              <p className="text-sm text-gray-600">
                {runResults.length} request{runResults.length !== 1 ? 's' : ''} executed
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {runResults.map((result, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      result.method === 'GET' ? 'bg-green-100 text-green-800' :
                      result.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      result.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      result.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {result.method}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {result.url}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`flex items-center gap-1 font-medium ${
                      result.isSuccess ? "text-green-600" : "text-red-600"
                    }`}>
                      {result.isSuccess ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      {result.statusCode}
                    </span>
                    <span className="text-gray-600">
                      {result.durationMs}ms
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-700">Response Body</span>
                  </div>
                  <pre className="p-4 text-sm text-gray-800 overflow-auto max-h-72 whitespace-pre-wrap">
                    {result.responseBody}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">
              Deleting this integration will permanently remove all requests and cannot be undone. 
              This action is irreversible.
            </p>
            <Button
              onClick={handleDeleteIntegration}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Delete Integration Forever
            </Button>
          </div>
        </div>
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
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 p-6 hover:scale-[1.02]"
    >
      <div className="flex items-center gap-4">
        <div
          className="cursor-grab text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          {...attributes}
          {...listeners}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
        
        <div onClick={() => onEdit(request)} className="flex-1 cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              request.method === 'GET' ? 'bg-green-100 text-green-800' :
              request.method === 'POST' ? 'bg-blue-100 text-blue-800' :
              request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
              request.method === 'DELETE' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {request.method}
            </span>
            <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {request.name?.trim() || "Untitled Request"}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {request.url || "No URL specified"}
          </p>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            onClick={() => onEdit(request)}
          >
            <Pencil size={18} className="text-gray-600 hover:text-indigo-600" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            onClick={() => onDelete(request.id)}
          >
            <Trash2 size={18} className="text-gray-600 hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
