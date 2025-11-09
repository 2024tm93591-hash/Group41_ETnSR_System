FROM node:18
WORKDIR /app
COPY notification-service/package.json ./  
COPY notification-service/package-lock.json ./  
RUN npm config set registry https://registry.npmmirror.com && npm install 
RUN npm install --only=production
COPY notification-service/ .
COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it
EXPOSE 3005
CMD ["node", "index.js"]