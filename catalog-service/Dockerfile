FROM node:18
WORKDIR /app
COPY catalog-service/package.json ./  
COPY catalog-service/package-lock.json ./ 
RUN npm config set registry https://registry.npmmirror.com && npm install 
RUN npm install --only=production
COPY catalog-service/ .
COPY ../wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it
EXPOSE 3001
ENV DB_HOST=catalog-db
ENV DB_USER=app_user
ENV DB_PASS=StrongP@ssw0rd!
CMD ["wait-for-it", "catalog-db:1433", "--timeout=60", "--", "node", "index.js"]