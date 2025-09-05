# OrgSend

Web-based platform enabling organizations to manage member communications through email and SMS broadcasting.

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Windows-Specific Setup

On Windows systems, the development server automatically handles file system permission issues with Windows system directories. The configuration includes:

- Automatic exclusion of Windows system directories (`Application Data`, `AppData`, `Cookies`, etc.)
- Optimized file watching with polling to avoid permission conflicts
- Proper path handling for Windows file systems

If you encounter any file system permission issues, ensure the project is not located in a system-protected directory.

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run test         # Run tests
npm run lint         # Check code style
npm run format       # Format code
npm run typecheck    # Type checking
```
