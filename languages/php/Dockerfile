# ===========================================================
# PHP Dockerfile
# ===========================================================
# languages/php/Dockerfile
FROM php:8.2-cli-alpine

# Create a non-root user to run the code
RUN addgroup -S coderunner && adduser -S coderunner -G coderunner

# Create code directory
RUN mkdir /code && chown coderunner:coderunner /code

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /code

# Command will be provided during container creation
