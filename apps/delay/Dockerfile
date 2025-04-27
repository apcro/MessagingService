# DEVELOPMENT
FROM node:18-alpine As development
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY .npmrc .
RUN npm install async
RUN npm ci
COPY . .

FROM node:18.7-alpine as build
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY .npmrc .
COPY . .
RUN npm install async
RUN npm ci
RUN npm run build:delay

FROM node:18.7-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY .npmrc .
RUN npm install async
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 3006
CMD npm run start:delay:prod