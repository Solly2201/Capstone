FROM node:20-alpine AS build
WORKDIR /workspace
COPY package.json ./
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm install --workspace @cap/web --workspace @cap/contracts
COPY packages/contracts ./packages/contracts
COPY apps/web ./apps/web
WORKDIR /workspace/apps/web
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
