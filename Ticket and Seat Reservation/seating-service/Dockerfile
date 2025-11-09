FROM node:18
WORKDIR /app
COPY seating-service/package.json ./  
RUN npm install
COPY . .
COPY ../wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it
EXPOSE 3002
CMD ["wait-for-it", "seating-db:1433", "--timeout=60", "--", "node", "index.js"]