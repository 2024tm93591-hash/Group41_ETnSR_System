FROM node:18
WORKDIR /app
COPY user-service/package.json ./  
COPY user-service/package-lock.json ./  
RUN npm config set registry https://registry.npmmirror.com && npm install 
RUN npm install --only=production
COPY user-service/ .
COPY ../wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it
EXPOSE 3000
CMD ["wait-for-it", "user-db:1433", "--timeout=60", "--", "node", "index.js"]