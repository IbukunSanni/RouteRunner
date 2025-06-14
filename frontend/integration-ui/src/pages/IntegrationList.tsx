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

interface Integration {
  id: string;
  name: string;
}

export default function IntegrationList() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">
          Your Integrations
        </h1>
        <Button
          onClick={() => setShowModal(true)}
          className="cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition"
        >
          + New Integration
        </Button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {integrations.map((integration) => (
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Name Your Integration</DialogTitle>
          </DialogHeader>

          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. User Auth Flow"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button
              className="bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100 px-4 py-2 rounded-md text-sm transition"
              onClick={() => {
                setNewName("");
                setShowModal(false);
              }}
            >
              Cancel
            </Button>

            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md text-sm transition"
              onClick={createNewIntegration}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
