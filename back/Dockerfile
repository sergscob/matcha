FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY db ./db

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate && npm run seed:if-empty && npm start"]
