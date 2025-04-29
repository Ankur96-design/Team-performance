#!/bin/bash

# Create Next.js app with TypeScript
npx create-next-app@latest fantasy-ipl-dream11 --typescript

# Navigate to project directory
cd fantasy-ipl-dream11

# Install shadcn UI
npx shadcn-ui@latest init

# Add Material UI
npm install @mui/material @emotion/react @emotion/styled

# Add data visualization libraries
npm install d3 recharts

# Add utilities
npm install axios lodash

# Add state management and data fetching
npm install zustand @tanstack/react-query

# Create basic folder structure
mkdir -p src/components/ui
mkdir -p src/components/dashboard
mkdir -p src/components/team
mkdir -p src/components/player
mkdir -p src/components/prediction
mkdir -p src/lib/data
mkdir -p src/lib/utils
mkdir -p src/lib/ai
mkdir -p src/pages/dashboard
mkdir -p src/pages/teams
mkdir -p src/pages/players
mkdir -p src/pages/prediction

echo "Project setup completed!"