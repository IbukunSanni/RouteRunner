import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Props for the Header component
 */
interface HeaderProps {
  /** Optional title to display in the center of the header */
  title?: string;
  /** Whether to show the back button (only shows when not on home page) */
  showBackButton?: boolean;
}

/**
 * Application Header Component
 *
 * Displays the RouteRunner branding, navigation, and optional page title.
 * Features a gradient background and responsive design.
 */
export default function Header({ title, showBackButton = false }: HeaderProps) {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Hook to get current route location
  const location = useLocation();
  // Check if we're on the home page to conditionally show back button
  const isHomePage = location.pathname === "/";

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      {/* Container with responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Back button and branding */}
          <div className="flex items-center space-x-4">
            {/* Conditional back button - only shows when enabled and not on home page */}
            {showBackButton && !isHomePage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/20 hover:text-white active:bg-white/30 active:scale-95 transition-all duration-200 cursor-pointer transform hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}

            {/* Application branding section - clickable to go home */}
            <div
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 active:opacity-60 transition-all duration-200 transform hover:scale-105 active:scale-95 rounded-lg p-2 hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              {/* App icon with lightning bolt */}
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              {/* App name and tagline */}
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  RouteRunner
                </h1>
                {/* Tagline hidden on small screens */}
                <p className="text-xs text-indigo-100 hidden sm:block">
                  API Integration Testing Tool
                </p>
              </div>
            </div>
          </div>

          {/* Center section: Optional page title */}
          {title && (
            <div className="flex-1 text-center">
              <h2 className="text-lg font-semibold text-white/90">{title}</h2>
            </div>
          )}

          {/* Right section: Version info */}
          <div className="flex items-center space-x-2">
            {/* Version number - hidden on small screens */}
            <div className="hidden sm:flex items-center space-x-1 text-xs text-indigo-100">
              <span>v1.5.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
