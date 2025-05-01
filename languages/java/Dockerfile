# languages/java/Dockerfile
FROM openjdk:17-slim

# Create a non-root user to run the code
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner

# Create code directory
RUN mkdir /code && chown coderunner:coderunner /code

# Create Java preferences directory and set permissions
RUN mkdir -p /home/coderunner/.java/.userPrefs && \
    chown -R coderunner:coderunner /home/coderunner

# Set environment variables to disable Java preferences
# ENV _JAVA_OPTIONS="-Djava.util.prefs.userRoot=/home/coderunner/.java/.userPrefs -Djava.awt.headless=true"

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /code

# Set home directory for the user
ENV HOME=/home/coderunner

# Command will be provided during container creation
CMD ["echo", "Java execution environment ready"]