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
RUN npm run build:messaging

FROM node:18.7-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY .npmrc .
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 3007
CMD npm run start:messaging:prod