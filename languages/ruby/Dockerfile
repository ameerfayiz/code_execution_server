# ===========================================================
# Ruby Dockerfile
# ===========================================================
# languages/ruby/Dockerfile
FROM ruby:3.1-slim

# Create a non-root user to run the code
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner

# Create code directory
RUN mkdir /code && chown coderunner:coderunner /code

# Install common gems
RUN gem install bundler rake sinatra

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /code

# Command will be provided during container creation