FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && \
    npm rebuild better-sqlite3 && \
    rm -rf /root/.npm

COPY index.js ./
COPY db ./db/

EXPOSE 3001

CMD ["node", "index.js"]