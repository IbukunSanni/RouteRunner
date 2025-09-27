# RouteRunner

A lightweight Postman-like tool to store and run chained API calls in order. Built with **.NET 9** backend and **React 19 + TypeScript + Vite + Tailwind CSS** frontend.

## Features

- Create, edit (including rearranging requests), delete API **Integrations** (named collections of requests)
- Each request supports:
  - Method, URL, Name, headers, query params, body
  - Extractors (JSONPath-based variable extraction from previous response)
  - Runtime values to substitute placeholders like `{{userId}}`
- Run the integration sequentially
  - Displays status code, duration, success/failure, and pretty-printed response
- Add bearer token headers
- Full CORS support
- **AI-powered integration generator** using OpenAI GPT
- **Enhanced error handling** with retry mechanisms for robust API interactions
- **Comprehensive environment configuration** with multiple setup options
- **SQLite database** support with Entity Framework Core
- **Logs info & errors** to console
- Swagger docs available
- Unit tests with comprehensive coverage
- Fully Dockerized for easy setup with development and production modes
- **Code formatting** with CSharpier for consistent C# code style

---
## 🚀 Demo

See RouteRunner's most powerful features in action:

### 1. 🤖 AI-Powered Integration Generation
*Describe your API workflow in plain English and watch AI create complete integrations with chaining, extractors, and realistic endpoints.*

![AI Generation](media/ai-generation.gif)

### 2. ⚡ Live API Execution & Request Management  
*Run real API calls sequentially, view responses in real-time, and manage requests with drag-and-drop reordering.*

![API Execution](media/api-execution.gif)

### 3. 🔗 Dynamic Variable Chaining & Runtime Values
*Extract data from responses, chain requests dynamically, and inject runtime values for flexible workflows.*

![Variable Chaining](media/variable-chaining.gif)

---

> **What makes RouteRunner special:** Unlike traditional API tools, RouteRunner combines AI-powered generation with intelligent request chaining, making complex API testing workflows as simple as describing what you want to achieve.

> All demo media is stored in the `media/` folder.

## Tech Stack

### Backend (.NET 9)
- **ASP.NET Core 9** with C# 12
- **Entity Framework Core** with SQLite
- **OpenAI API integration** for AI-powered features
- **Swagger/OpenAPI** documentation
- **Comprehensive error handling** with retry logic
- **CSharpier** for code formatting
- **DotNetEnv** for environment variable management

### Frontend (React 19)
- **React 19** with **TypeScript**
- **Vite** for build tooling and HMR
- **Tailwind CSS v4** for styling
- **React Router v7** for navigation
- **React Hook Form** with Zod validation
- **Radix UI** components
- **Lucide React** icons
- **Drag & Drop** functionality with dnd-kit
- **Code editing** with syntax highlighting

## Project Structure

```
RouteRunner/
├── .config/              # Development tools configuration
│   └── dotnet-tools.json # CSharpier and other .NET tools
├── .github/              # GitHub workflows and CI/CD
├── backend/              # .NET 9 API
│   ├── ApiRunner/        # Controllers, Services, Models, Program.cs
│   └── ApiRunner.Tests/  # Unit + Integration Tests
├── frontend/             # React 19 + TypeScript UI
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   └── Dockerfile       # Frontend container setup
├── samples/              # Sample integrations and collections
├── media/                # Documentation assets
├── docker-compose.yml    # Production Docker setup
├── docker-compose.override.yml  # Development overrides
└── README.md
```

---

## Getting Started with Docker

> ✅ Prerequisites: Docker installed and Docker Desktop running

### Development Mode (Recommended)
```bash
git clone <repository-url>
cd RouteRunner
docker-compose up --build
```

This starts both services in development mode with:
- **Hot reloading** enabled for both frontend and backend
- **Volume mounting** for live code changes
- **Development environment** configuration

### Production Mode
```bash
docker-compose -f docker-compose.yml up --build
```

### Access Points
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5088](http://localhost:5088)
- Swagger Documentation: [http://localhost:5088/swagger](http://localhost:5088/swagger)

---

## Development

### Run Tests
```bash
cd backend/ApiRunner.Tests
dotnet test
```


### Local Development (without Docker)

**Backend:**
```bash
cd backend/ApiRunner
dotnet restore
dotnet run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Sample Integration

You can import a sample integration from `samples/sample-integration.json` or manually create one via the UI.

A Postman collection export is also available at `samples/postman-collection.json`.

## AI Integration Generator

RouteRunner includes an **AI-powered integration generator** that creates complete API test workflows from natural language descriptions using OpenAI GPT.

### Features
- **Natural language processing** to understand API workflow descriptions
- **Automatic request generation** with realistic endpoints, methods, and data
- **Smart variable extraction** and chaining between requests
- **Enhanced error handling** with retry mechanisms for reliable AI interactions
- **Comprehensive validation** of API keys and responses

### Setup OpenAI API Key

The application supports **multiple configuration methods** with robust environment variable handling:

**Option 1: .env File (Recommended for Development)**
1. Copy `backend/ApiRunner/.env.example` to `backend/ApiRunner/.env`
2. Replace `your_openai_api_key_here` with your actual OpenAI API key
3. The `.env` file is automatically ignored by git

**Option 2: Environment Variable**
```bash
# Windows Command Prompt
set OPENAI_API_KEY=your_key_here

# Windows PowerShell
$env:OPENAI_API_KEY="your_key_here"

# Linux/Mac
export OPENAI_API_KEY=your_key_here
```

**Option 3: Configuration File**
1. Copy `backend/ApiRunner/appsettings.Development.template.json` to `appsettings.Development.json`
2. Replace `your_openai_api_key_here` with your actual key
3. **Never commit this file to version control**

### Usage Examples
Use natural language to generate complete API workflows:
- "Create a user, then get all users, then delete the user"
- "Test a login flow with authentication and protected endpoints"
- "Set up an e-commerce flow: create product, add to cart, checkout"
- "User management workflow with CRUD operations"

---

## API Docs (Swagger)

When running, visit:

```
http://localhost:5088/swagger
```

To explore the endpoints interactively.

---


## Recent Updates

### ✅ Completed
- **Upgraded to .NET 9** with latest C# features
- **Enhanced AI integration** with robust error handling and retry mechanisms
- **Comprehensive environment configuration** with multiple setup options
- **SQLite database integration** with Entity Framework Core
- **Code formatting standards** with CSharpier
- **Improved Docker setup** with development and production modes
- **React 19 upgrade** with TypeScript and modern tooling

## What's Coming Next

- **User Authentication & Authorization**
- **OAuth 2.0 flow support** for complex authentication scenarios
- **Advanced conditional logic** and branching in workflows
- **Persistent run logs** and execution history
- **Team collaboration** features
- **API performance monitoring** and analytics
- **Custom plugins** and extensibility




