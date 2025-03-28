FROM node:19.6 as builder

WORKDIR /app

# Copy only package.json first for better layer caching
COPY package.json .

RUN apt-get update && apt-get install git

RUN npm install

COPY . .

