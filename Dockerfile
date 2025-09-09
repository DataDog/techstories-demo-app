FROM node:22

# install wait-for-it
RUN apt-get update && apt-get install -y wait-for-it

WORKDIR /app

# Copy prisma schema first
COPY prisma ./prisma/

# Copy package files
COPY package.json .
COPY package-lock.json .

RUN npm install

# Copy remaining files
COPY . .

ENV POSTGRES_USER=user
ENV POSTGRES_PASSWORD=password
ENV DATABASE_URL=postgresql://user:password@127.0.0.1:5432/db?schema=techstories

ENV NEXTAUTH_SECRET=secret
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXT_PUBLIC_QUOTES_API_URL=http://localhost:3001
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "dev"]