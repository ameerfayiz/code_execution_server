# ===========================================================
# C# Dockerfile
# ===========================================================
# languages/csharp/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine

# Create a non-root user to run the code
RUN addgroup -S coderunner && adduser -S coderunner -G coderunner

# Create code directory
RUN mkdir /code && chown coderunner:coderunner /code

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /code

# Command will be provided during container creation
