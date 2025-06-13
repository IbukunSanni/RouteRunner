import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ApiRequest } from "@/types/integration"; // Or define inline if needed
import { useState } from "react";

interface EditRequestModalProps {
  open: boolean;
  onClose: () => void;
  request: ApiRequest;
  onSave: (updated: ApiRequest) => void;
}

export default function EditRequestModal({
  open,
  onClose,
  request,
  onSave,
}: EditRequestModalProps) {
  const [draft, setDraft] = useState<ApiRequest>(request);

  const updateField = <K extends keyof ApiRequest>(
    key: K,
    value: ApiRequest[K]
  ) => {
    setDraft({ ...draft, [key]: value });
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white text-black shadow-xl">
        <DialogHeader>
          <DialogTitle>Edit Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={draft.method}
              onChange={(e) => updateField("method", e.target.value)}
            >
              {["GET", "POST", "PUT", "DELETE", "PATCH"].map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <Input
              value={draft.url}
              onChange={(e) => updateField("url", e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1"
            />
          </div>

          <Textarea
            value={draft.body ?? ""}
            onChange={(e) => updateField("body", e.target.value)}
            rows={4}
            placeholder="Request body (JSON)"
          />

          {/* Add headers and extractors in next step */}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="destructive"   onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} >Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
