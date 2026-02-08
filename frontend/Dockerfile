FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

# Use 'dev' instead of 'start' (common for Vite/React)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8081"]