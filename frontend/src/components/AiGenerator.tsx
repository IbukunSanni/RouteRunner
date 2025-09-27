import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Wand2, Loader2 } from "lucide-react";
import { api } from "@/api/client";

/**
 * Props for the AiGenerator component
 */
interface AiGeneratorProps {
  /** Callback function called when AI successfully generates an integration */
  onIntegrationGenerated: (integration: unknown) => void;
}

/**
 * AI Integration Generator Component
 *
 * Allows users to describe an API integration in natural language
 * and uses AI to generate a complete integration with multiple requests,
 * proper chaining, headers, and extractors.
 */
export function AiGenerator({ onIntegrationGenerated }: AiGeneratorProps) {
  // User's natural language description of the integration they want
  const [prompt, setPrompt] = useState("");
  // Loading state while AI is generating the integration
  const [isGenerating, setIsGenerating] = useState(false);
  // Error message to display if generation fails
  const [error, setError] = useState("");

  /**
   * Handles the AI generation process
   *
   * Sends the user's prompt to the backend AI service which uses OpenAI
   * to generate a complete integration with multiple API requests
   */
  const handleGenerate = async () => {
    // Don't proceed if prompt is empty
    if (!prompt.trim()) return;

    // Set loading state and clear any previous errors
    setIsGenerating(true);
    setError("");

    try {
      // Call the backend AI generation endpoint
      const response = await api.post("/ai/generate", { prompt });

      // Pass the generated integration back to parent component
      onIntegrationGenerated(response.data);

      // Clear the prompt on successful generation
      setPrompt("");
    } catch (err) {
      // Type-safe error handling for axios errors
      const error = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };

      // Display the most specific error message available
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to generate integration"
      );
    } finally {
      // Always reset loading state
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Integration Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text area for user to describe their integration needs */}
        <div>
          <Textarea
            placeholder="Describe the API integration you want to create...&#10;&#10;Examples:&#10;• Create a user, then get all users, then delete the user&#10;• Test a login flow with authentication&#10;• Get weather data for multiple cities"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Error message display */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {/* Generate button with loading state */}
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`w-full transition-all duration-200 ${
            !prompt.trim()
              ? "bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Integration
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
