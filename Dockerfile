FROM node:20-alpine

WORKDIR /node-app

ENV PORT=8081

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Primeiro instala as dependências
COPY package.json package-lock.json ./
RUN npm ci

# Depois copia o projeto (Isto torna mais rápido o build devido ao cache)
COPY . .
RUN npx auth secret


# Eu sinceramente prefiro dessa forma, mas se deer B.O eu coloco o ENTRYPOINT npm start de volta 
# Acho melhor pq ele permite que eu passe argumentos para o npm start tipo: --port=3000
CMD ["npm", "run", "build"]

CMD ["npm", "start"]
# ...existing code...

# docker build -t personal-finance.
