import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, AlertTriangle } from "lucide-react";

/**
 * Props for the PasswordDialog component
 */
interface PasswordDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should be closed */
  onClose: () => void;
  /** Callback when password is submitted */
  onPasswordSubmit: (password: string) => void;
  /** Loading state while validating password */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * Password Dialog Component
 *
 * Prompts the user for a password before allowing AI generation access.
 * Includes security messaging and error handling.
 */
export function PasswordDialog({
  open,
  onClose,
  onPasswordSubmit,
  isLoading = false,
  error,
}: PasswordDialogProps) {
  const [password, setPassword] = useState("");

  /**
   * Handles form submission with password validation
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onPasswordSubmit(password);
  };

  /**
   * Handles dialog close and resets password
   */
  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                AI Access Required
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            This feature uses AI credits and requires password authentication.
            Please enter the access password to continue with AI generation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Access Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter access password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* Error message display */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? "Verifying..." : "Continue"}
            </Button>
          </DialogFooter>
        </form>

        {/* Security notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Lock className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Security Notice</p>
              <p className="mt-1">
                This password protects against unauthorized AI usage and credit consumption.
                Each generation request consumes API credits.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}