# DEVELOPMENT
FROM node:18-alpine As development
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY .npmrc .
RUN npm ci
COPY . .

FROM node:18.7-alpine as build
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY .npmrc .
COPY . .
RUN npm ci
RUN npm run build:api
RUN npm run build:repl

FROM node:18.7-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY .npmrc .
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 3005
CMD npm run start:api:prod