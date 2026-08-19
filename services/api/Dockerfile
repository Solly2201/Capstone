FROM node:20-alpine AS dependencies
WORKDIR /workspace
COPY package.json ./
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY services/api/package.json ./services/api/package.json
RUN npm install --workspace @cap/api --workspace @cap/contracts

FROM node:20-alpine
WORKDIR /workspace
COPY --from=dependencies /workspace/node_modules ./node_modules
COPY --from=dependencies /workspace/packages ./packages
COPY packages/contracts ./packages/contracts
COPY services/api ./services/api
WORKDIR /workspace/services/api
EXPOSE 4000
CMD ["npm", "run", "dev"]
