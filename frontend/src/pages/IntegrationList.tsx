import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button"; // Shadcn
import { Card, CardContent } from "@/components/ui/card"; // Shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AiGenerator } from "@/components/AiGenerator";

interface Integration {
  id: string;
  name: string;
}

export default function IntegrationList() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    api
      .get("/integrations")
      .then((res) => setIntegrations(res.data))
      .catch((err) => console.error("Failed to fetch integrations", err))
      .finally(() => setLoading(false));
  }, []);

  const createNewIntegration = async () => {
    if (!newName.trim()) return;

    try {
      const res = await api.post("/integrations", {
        name: newName,
        requests: [],
      });
      setShowModal(false);
      setNewName("");
      navigate(`/integrations/${res.data.id}`);
    } catch (err) {
      console.error("Failed to create integration", err);
    }
  };

  const handleAiIntegrationGenerated = async (integration: unknown) => {
    try {
      // Save the AI-generated integration to the backend
      const res = await api.post("/integrations", integration);
      setShowAiModal(false);
      // Refresh the integrations list
      const updatedIntegrations = await api.get("/integrations");
      setIntegrations(updatedIntegrations.data);
      // Navigate to the new integration
      navigate(`/integrations/${res.data.id}`);
    } catch (err) {
      console.error("Failed to save AI-generated integration", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Integrations
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and run your API integration workflows
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAiModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            ✨ AI Generate
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            + Manual Create
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading integrations...</span>
        </div>
      )}

      {!loading && integrations.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No integrations yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first integration to get started with API testing
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setShowAiModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-lg"
            >
              ✨ Generate with AI
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg"
            >
              Create Manually
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg hover:shadow-indigo-200/50"
            onClick={() => navigate(`/integrations/${integration.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {integration.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Click to edit and run
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white rounded-xl shadow-2xl border-0 max-w-md">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Create New Integration
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Give your integration a descriptive name
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. User Authentication Flow"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && createNewIntegration()}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewName("");
                  setShowModal(false);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </Button>

              <Button
                onClick={createNewIntegration}
                disabled={!newName.trim()}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Integration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="bg-white rounded-xl shadow-2xl border-0 max-w-3xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Generate Integration with AI
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Describe what you want to build and AI will create the integration
              for you
            </p>
          </DialogHeader>

          <AiGenerator onIntegrationGenerated={handleAiIntegrationGenerated} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
