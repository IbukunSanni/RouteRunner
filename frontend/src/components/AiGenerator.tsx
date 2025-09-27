import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Wand2, Loader2, Lock } from "lucide-react";
import { api } from "@/api/client";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
  // Password for AI access protection
  const [password, setPassword] = useState("");
  // Loading state while AI is generating the integration
  const [isGenerating, setIsGenerating] = useState(false);
  // Error message to display if generation fails
  const [error, setError] = useState("");

  /**
   * Handles the AI generation process
   *
   * Sends the user's prompt and password to the backend AI service
   * which uses OpenAI to generate a complete integration with multiple API requests
   */
  const handleGenerate = async () => {
    // Don't proceed if prompt or password is empty
    if (!prompt.trim() || !password.trim()) return;

    // Set loading state and clear any previous errors
    setIsGenerating(true);
    setError("");

    try {
      // Call the backend AI generation endpoint with password
      const response = await api.post("/ai/generate", {
        prompt,
        password
      });

      // Pass the generated integration back to parent component
      onIntegrationGenerated(response.data);

      // Clear the prompt and password on successful generation
      setPrompt("");
      setPassword("");
    } catch (err) {
      // Type-safe error handling for axios errors
      const error = err as {
        response?: { data?: { error?: string; details?: string }, status?: number };
        message?: string;
      };

      // Display the most specific error message available
      setError(
        error.response?.data?.details ||
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
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5" />
            <span>AI Integration Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Text area for user to describe their integration needs */}
          <div>
            <Label htmlFor="prompt" className="text-sm font-medium text-gray-700">
              Describe your API integration
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe the API integration you want to create...&#10;&#10;Examples:&#10;• Create a user, then get all users, then delete the user&#10;• Test a login flow with authentication&#10;• Get weather data for multiple cities"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none mt-1"
              disabled={isGenerating}
            />
          </div>

          {/* Password input for AI access protection */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>AI Access Password</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter access password to generate"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">
              This password protects against unauthorized AI usage and credit consumption.
            </p>
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
            disabled={!prompt.trim() || !password.trim() || isGenerating}
            className={`w-full transition-all duration-200 ${
              !prompt.trim() || !password.trim()
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
    </>
  );
}
