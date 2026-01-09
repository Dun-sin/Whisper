# Base build
FROM node:18-alpine AS base
WORKDIR /usr/src
COPY constants.json .

# Server build
FROM base AS server-base
WORKDIR /server
COPY server/package* .
RUN npm install
COPY server/ .

# Client build
FROM base AS client-base
WORKDIR /client
COPY client/package* .
RUN npm install
COPY client/ .

# Final build
FROM base AS final
WORKDIR /usr/src

COPY --from=server-base /server ./server
COPY --from=client-base /client ./client

RUN npm i -g concurrently

EXPOSE 4000 
EXPOSE 5173

CMD concurrently "npm --prefix ./server run dev" "npm --prefix ./client run dev"