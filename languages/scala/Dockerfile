# ===========================================================
# Scala Dockerfile
# ===========================================================
# languages/scala/Dockerfile
FROM sbtscala/scala-sbt:eclipse-temurin-jammy-17.0.10_7_1.10.2_3.5.1

# Create a non-root user to run the code
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner -m

# Create code directory
RUN mkdir /code && chown coderunner:coderunner /code

# Create home directory and set permissions
RUN mkdir -p /home/coderunner && chown -R coderunner:coderunner /home/coderunner

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /code

# Set HOME environment variable
ENV HOME=/home/coderunner

# Command will be provided during container creation
