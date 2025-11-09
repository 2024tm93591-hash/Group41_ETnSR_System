FROM node:18
WORKDIR /app
COPY payment-service/package.json ./  
COPY payment-service/package-lock.json ./  
RUN npm config set registry https://registry.npmmirror.com && npm install 
RUN npm install --only=production
COPY payment-service/. .  
COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it
EXPOSE 3004
CMD ["wait-for-it", "payment-db:1433", "--timeout=60", "--", "node", "index.js"]
