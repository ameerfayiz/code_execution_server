# ===========================================================
# Assembly (x86_64 NASM) Dockerfile
# ===========================================================
# languages/assembly/Dockerfile
FROM debian:bookworm-slim

# Install assembler and linker
RUN apt-get update && apt-get install -y --no-install-recommends \
    nasm \
    binutils \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user to run the code
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner

# Create code directory
RUN mkdir /code && chown coderunner:coderunner /code

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /code

# Command will be provided during container creation
