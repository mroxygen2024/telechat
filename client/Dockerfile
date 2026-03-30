# ----------- Base -----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ----------- Development -----------
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# ----------- Build -----------
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# ----------- Production -----------
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
