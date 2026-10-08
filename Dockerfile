# Build Stage: Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/os-tracker-frontend
COPY os-tracker-frontend/package*.json ./
RUN npm install
COPY os-tracker-frontend/ ./
RUN npm run build

# Runner Stage: Backend + Built Frontend
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY os-tracker-backend/package*.json ./os-tracker-backend/
RUN cd os-tracker-backend && npm install --omit=dev

# Copy backend source code
COPY os-tracker-backend/ ./os-tracker-backend/

# Copy compiled frontend from build stage
COPY --from=frontend-builder /app/os-tracker-frontend/dist ./os-tracker-frontend/dist

ENV PORT=5001
EXPOSE 5001

CMD ["node", "os-tracker-backend/server.js"]
