FROM node:20-alpine

WORKDIR /node-app

ENV PORT=3000

ARG NEXT_PUBLIC_API_URL
ARG AUTH_SECRET
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV AUTH_SECRET=${AUTH_SECRET}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build da aplicação
RUN npm run build

RUN npx auth secret

CMD ["npm", "start", "--", "--port=3000"]