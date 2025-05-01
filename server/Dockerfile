# Server Dockerfile 
FROM node:18-alpine 
 
# Create app directory 
WORKDIR /usr/src/app 
 
# Install app dependencies 
COPY package*.json ./ 
RUN npm install
 
# Bundle app source 
COPY . . 
 
# Create non-root user 
RUN addgroup -S coderunner && adduser -S coderunner -G coderunner 
# We need to run as root to access Docker socket 
# USER coderunner 
 
# Expose port 
EXPOSE 3000 
 
# Start application with nodemon in :
# development mode

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then npm run dev; else npm start; fi"]

# Production 
# CMD ["node", "server.js"] 
