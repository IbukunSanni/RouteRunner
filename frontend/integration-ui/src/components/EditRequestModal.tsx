/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ApiRequest } from "@/types/integration";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

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
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<[string, string][]>(
    Object.entries(draft.headers || {})
  );
  const [extractors, setExtractors] = useState<[string, string][]>(
    Object.entries(draft.extractors || {})
  );

  // Sync header key-value pairs back to the draft object
  useEffect(() => {
    const cleanObject = (entries: [string, string][]) =>
      Object.fromEntries(entries.filter(([k]) => k.trim() !== ""));

    updateField("headers", cleanObject(headers));
    updateField("extractors", cleanObject(extractors));
  }, [headers, extractors]);

  // Generic field updater for draft state
  const updateField = <K extends keyof ApiRequest>(
    key: K,
    value: ApiRequest[K]
  ) => {
    setDraft({ ...draft, [key]: value });
  };

  // Utility to update a key-value object like extractors
  const updateKVField = (
    obj: Record<string, string>,
    setter: (val: Record<string, string>) => void,
    key: string,
    value: string
  ) => {
    setter({ ...obj, [key]: value });
  };

  // Validate and save the request data
  const handleSave = () => {
    if (draft.body && draft.body.trim().length > 0) {
      try {
        JSON.parse(draft.body);
      } catch {
        setBodyError("Invalid JSON format");
        return;
      }
    }
    setBodyError(null);
    onSave(draft);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white text-black shadow-xl">
        <DialogHeader>
          <DialogTitle>Edit Request</DialogTitle>
        </DialogHeader>

        <Input
          value={draft.name ?? ""}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Request name (e.g. Login)"
          className="text-sm"
        />

        <div className="space-y-4">
          {/* Method and URL input fields */}
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

          {/* Request body input with JSON validation */}
          <div className="space-y-1">
            <Textarea
              value={draft.body ?? ""}
              onChange={(e) => updateField("body", e.target.value)}
              rows={4}
              placeholder="Request body (JSON)"
              className={bodyError ? "border-red-500" : ""}
            />
            {bodyError && <p className="text-sm text-red-500">{bodyError}</p>}
          </div>

          {/* Header key-value input fields */}
          <div className="space-y-2">
            <p className="font-semibold text-sm">Headers</p>

            {headers.map(([key, value], index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={key}
                  onChange={(e) => {
                    const updated = [...headers];
                    updated[index][0] = e.target.value;
                    setHeaders(updated);
                  }}
                  placeholder="Header Key"
                  className="w-1/3"
                />
                <Input
                  value={value}
                  onChange={(e) => {
                    const updated = [...headers];
                    updated[index][1] = e.target.value;
                    setHeaders(updated);
                  }}
                  placeholder="Header Value"
                  className="w-2/3"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer"
                  onClick={() =>
                    setHeaders(headers.filter((_, i) => i !== index))
                  }
                >
                  <X className="cursor-pointer h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => setHeaders([...headers, ["", ""]])}
              className="text-xs mt-2"
            >
              + Add Header
            </Button>
          </div>

          {/* Extractors section: define values to extract from responses */}
          <div className="space-y-2">
            <p className="font-semibold text-sm">Extractors</p>

            {extractors.map(([key, path], index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={key}
                  onChange={(e) => {
                    const updated = [...extractors];
                    updated[index][0] = e.target.value;
                    setExtractors(updated);
                  }}
                  placeholder="Token Key (e.g. userId)"
                  className="w-1/3"
                />
                <Input
                  value={path}
                  onChange={(e) => {
                    const updated = [...extractors];
                    updated[index][1] = e.target.value;
                    setExtractors(updated);
                  }}
                  placeholder="JSONPath (e.g. $.id)"
                  className="w-2/3"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setExtractors(extractors.filter((_, i) => i !== index))
                  }
                >
                  <span className="text-red-500">✕</span>
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => setExtractors([...extractors, ["", ""]])}
              className="text-xs mt-2"
            >
              + Add Extractor
            </Button>
          </div>
        </div>

        {/* Modal action buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            className=" cursor-pointer bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-100 font-medium text-sm px-4 py-2 rounded-md transition"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            className="cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 font-medium text-sm px-4 py-2 rounded-md transition"
            onClick={handleSave}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
