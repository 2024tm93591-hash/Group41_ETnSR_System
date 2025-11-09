FROM node:18
WORKDIR /app
COPY order-service/package.json ./  
COPY order-service/package-lock.json ./  
RUN npm config set registry https://registry.npmmirror.com && npm install 
RUN npm install --only=production
COPY order-service/ .
COPY ../wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it
EXPOSE 3003
ENV DB_HOST=order-db
ENV DB_USER=app_user
ENV DB_PASS=StrongP@ssw0rd!
CMD ["wait-for-it", "order-db:1433", "--timeout=60", "--", "node", "index.js"]