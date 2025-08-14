import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export default function Header({ title, showBackButton = false }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && !isHomePage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  RouteRunner
                </h1>
                <p className="text-xs text-indigo-100 hidden sm:block">
                  API Integration Testing Tool
                </p>
              </div>
            </div>
          </div>

          {title && (
            <div className="flex-1 text-center">
              <h2 className="text-lg font-semibold text-white/90">
                {title}
              </h2>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1 text-xs text-indigo-100">
              <span>v1.5.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}