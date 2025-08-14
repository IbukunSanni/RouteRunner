
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";
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

    setDraft(prev => ({
      ...prev,
      headers: cleanObject(headers),
      extractors: cleanObject(extractors)
    }));
  }, [headers, extractors]);

  // Generic field updater for draft state
  const updateField = <K extends keyof ApiRequest>(
    key: K,
    value: ApiRequest[K]
  ) => {
    setDraft({ ...draft, [key]: value });
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
            <Editor
              value={draft.body ?? ""}
              onValueChange={(code) => updateField("body", code)}
              highlight={(code) =>
                Prism.highlight(code, Prism.languages.json, "json")
              }
              padding={12}
              className={`text-sm font-mono border rounded w-full min-h-[120px] ${
                bodyError ? "border-red-500" : "border-zinc-300"
              }`}
              style={{
                backgroundColor: "#f8f8f8",
                fontFamily: "monospace",
              }}
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
            <div className="flex flex-col space-y-1">
              <p className="font-semibold text-sm">Extractors</p>
              <p className="text-xs text-zinc-500 leading-snug">
                Extract a value from this request's JSON response using a{" "}
                <a
                  href="https://jsonpath.com/"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  JSONPath
                </a>{" "}
                expression. For example:
              </p>
              <ul className="text-xs text-zinc-500 list-disc list-inside">
                <li>
                  <code className="text-indigo-600 font-mono">userId</code> →{" "}
                  <code className="text-indigo-600 font-mono">$.id</code>
                </li>
                <li>
                  <code className="text-indigo-600 font-mono">token</code> →{" "}
                  <code className="text-indigo-600 font-mono">
                    $.data.token
                  </code>
                </li>
              </ul>
            </div>

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
                  className="w-2/5"
                />
                <Input
                  value={path}
                  onChange={(e) => {
                    const updated = [...extractors];
                    updated[index][1] = e.target.value;
                    setExtractors(updated);
                  }}
                  placeholder="e.g. $.id or $.data.token"
                  className="w-3/5"
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


