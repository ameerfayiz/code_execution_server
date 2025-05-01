# ===========================================================
# JavaScript Dockerfile
# ===========================================================
# languages/javascript/Dockerfile
FROM node:18-alpine

# Create a non-root user to run the code
RUN addgroup -S coderunner && adduser -S coderunner -G coderunner

# Create code directory
RUN mkdir /code && chown coderunner:coderunner /code

# Install common packages
RUN npm install -g lodash axios express

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /code

# Command will be provided during container creation