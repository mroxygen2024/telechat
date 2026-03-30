# ----------- Base -----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ----------- Development -----------
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ----------- Production -----------
FROM base AS prod
ENV NODE_ENV=production
RUN npm install --omit=dev && npm cache clean --force
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
