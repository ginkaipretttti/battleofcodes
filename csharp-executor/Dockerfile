FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /app

COPY package*.json ./

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]
