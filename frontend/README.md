# RouteRunner Frontend

Modern React frontend for RouteRunner - A Postman-like API integration testing tool with AI-powered generation capabilities.

## Tech Stack

- **React 19** with **TypeScript** for type-safe component development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS v4** for utility-first styling and responsive design
- **React Router v7** for client-side routing and navigation
- **React Hook Form** with **Zod** validation for robust form handling
- **Radix UI** components for accessible, unstyled UI primitives
- **Lucide React** for beautiful, consistent icons
- **dnd-kit** for drag-and-drop functionality in request ordering
- **Axios** for HTTP client with interceptors and error handling

## Features

### Core Functionality
- **Integration Management**: Create, edit, delete, and organize API integration workflows
- **Request Builder**: Visual editor for HTTP requests with method, URL, headers, and body
- **Drag & Drop**: Reorder requests within integrations using intuitive drag-and-drop
- **Response Viewer**: Pretty-printed JSON responses with status codes and timing
- **Variable Extraction**: JSONPath-based extraction from previous responses for request chaining

### AI-Powered Generation
- **Natural Language Processing**: Describe API workflows in plain English
- **Intelligent Request Creation**: AI generates complete integrations with realistic endpoints
- **Smart Chaining**: Automatic variable extraction and placeholder setup between requests
- **Error Handling**: Robust retry mechanisms and validation for AI interactions

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Animations**: Smooth hover effects, button states, and transitions
- **Visual Feedback**: Loading states, error messages, and success indicators
- **Keyboard Navigation**: Full keyboard accessibility support
- **Dark Mode Ready**: Prepared for theme switching (future enhancement)

## Project Structure

```
frontend/
├── src/
│   ├── api/              # HTTP client and API configuration
│   │   └── client.ts     # Axios setup with interceptors
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Radix UI component wrappers
│   │   ├── AiGenerator.tsx    # AI integration generation
│   │   ├── Header.tsx         # Application header with navigation
│   │   ├── EditRequestModal.tsx   # Request editing interface
│   │   └── KeyValueEditor.tsx     # Headers/extractors editor
│   ├── pages/           # Route-level components
│   │   ├── IntegrationList.tsx    # Integration management
│   │   └── IntegrationEditor.tsx  # Request editing and execution
│   ├── types/           # TypeScript type definitions
│   │   └── integration.ts     # Core data models
│   ├── lib/             # Utility functions and helpers
│   ├── assets/          # Static assets and images
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── public/              # Static files served directly
├── Dockerfile           # Multi-stage Docker build
├── nginx.conf           # Production nginx configuration
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite build configuration
```

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Local Development
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Variables
Create a `.env.local` file for local development:
```env
VITE_API_URL=http://localhost:5088
```

### Docker Development
```bash
# Development mode with hot reload
docker-compose up

# Production build
docker-compose -f docker-compose.yml up
```

## API Integration

The frontend communicates with the .NET backend through a RESTful API:

- **Base URL**: Configurable via `VITE_API_URL` environment variable
- **Authentication**: Currently stateless (future: JWT tokens)
- **Error Handling**: Centralized error interceptors with user-friendly messages
- **Request Logging**: Development-mode logging for debugging

### Key Endpoints
- `GET /integrations` - List all integrations
- `POST /integrations` - Create new integration
- `GET /integrations/{id}` - Get integration details
- `PUT /integrations/{id}` - Update integration
- `DELETE /integrations/{id}` - Delete integration
- `POST /integrations/{id}/run` - Execute integration
- `POST /ai/generate` - AI-powered integration generation

## Component Architecture

### State Management
- **Local State**: React hooks (`useState`, `useEffect`) for component-level state
- **Form State**: React Hook Form for complex form handling with validation
- **API State**: Direct API calls with loading/error states (future: React Query)

### Styling Approach
- **Utility-First**: Tailwind CSS for rapid UI development
- **Component Variants**: Conditional classes for different states
- **Responsive Design**: Mobile-first breakpoints and adaptive layouts
- **Animations**: CSS transitions and transforms for smooth interactions

### Type Safety
- **Strict TypeScript**: Full type coverage for props, state, and API responses
- **Zod Validation**: Runtime type validation for forms and API data
- **Interface Definitions**: Shared types between frontend and backend

## Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting with React Router
- **Tree Shaking**: Vite eliminates unused code in production builds
- **Asset Optimization**: Image compression and lazy loading
- **Bundle Analysis**: Built-in Vite bundle analyzer for optimization insights

## Deployment

### Production Build
```bash
npm run build
# Outputs to dist/ directory
```

### Docker Production
```bash
docker build -t routerunner-frontend .
docker run -p 80:80 routerunner-frontend
```

### Vercel Deployment
The project includes `vercel.json` configuration for seamless Vercel deployment with proper routing support.

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live collaboration
- **Advanced Theming**: Dark mode and custom theme support
- **Offline Support**: Service worker for offline functionality
- **Performance Monitoring**: Integration with monitoring services
- **Accessibility**: Enhanced ARIA support and screen reader compatibility
