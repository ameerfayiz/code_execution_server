# syntax=docker/dockerfile:1
# ===========================================================
# Python Dockerfile (Optimized with Binary Wheels)
# ===========================================================
# languages/python/Dockerfile
FROM python:3.10-slim

# Upgrade pip to ensure binary wheel preference
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Create a non-root user to run the code
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner

# Create code directory
RUN mkdir /code && chown coderunner:coderunner /code

# Note: Heavy packages like numpy, pandas, matplotlib, scipy removed for faster builds
# Add packages as needed for your use case
# RUN pip install --prefer-binary \
#     numpy \
#     pandas \
#     matplotlib \
#     scipy

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /code

# Command will be provided during container creation