interface KeyValueEditorProps {
  label: string;
  pairs: [string, string][];
  onChange: (updated: [string, string][]) => void;
}

export default function KeyValueEditor({
  label,
  pairs,
  onChange,
}: KeyValueEditorProps) {
  const updatePair = (index: number, key: string, value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = [key, value];
    onChange(newPairs);
  };

  const addPair = () => {
    onChange([...pairs, ["", ""]]);
  };

  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    onChange(newPairs);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-700">{label}</h3>
      {pairs.map(([key, value], index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            className="flex-1 border border-zinc-300 rounded px-2 py-1 text-sm"
            placeholder="Key (e.g. name)"
            value={key}
            onChange={(e) => updatePair(index, e.target.value, value)}
          />
          <input
            type="text"
            className="flex-1 border border-zinc-300 rounded px-2 py-1 text-sm"
            placeholder="Value (e.g. Tarek)"
            value={value}
            onChange={(e) => updatePair(index, key, e.target.value)}
          />
          <button
            type="button"
            onClick={() => removePair(index)}
            className="text-red-500 hover:text-red-700 text-sm px-2"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addPair}
        className="text-sm text-indigo-600 hover:underline"
      >
        + Add {label.slice(0, -1) || "Value"}
      </button>
    </div>
  );
}
