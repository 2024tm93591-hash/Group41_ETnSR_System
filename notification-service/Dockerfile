FROM node:18
WORKDIR /app
COPY package.json ./  
COPY package-lock.json ./  
RUN npm config set registry https://registry.npmmirror.com && npm install 
RUN npm install --only=production
COPY . .
EXPOSE 3005
CMD ["node", "index.js"]