/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [activeTabs, setActiveTabs] = useState<
    Record<string, "headers" | "body" | "extractors">
  >({});

  const handleEditRequest = (req: ApiRequest) => {
  console.log("Edit modal should open for request:", req);
  // You'll eventually trigger a modal and pass `req` into it for editing
};


  useEffect(() => {
    if (!id) return;
    api
      .get(`/integrations/${id}`)
      .then((res) => {
        setIntegration(res.data);
        const initialTabs: Record<string, "headers" | "body" | "extractors"> =
          {};
        res.data.requests.forEach((r: ApiRequest) => {
          initialTabs[r.id] = "headers";
        });
        setActiveTabs(initialTabs);
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
