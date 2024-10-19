FROM node:19.6 as builder
WORKDIR /app
COPY package.json .

RUN npm install
COPY . .

