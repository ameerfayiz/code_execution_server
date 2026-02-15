# ===========================================================
# Octave Dockerfile (MATLAB alternative)
# ===========================================================
# languages/octave/Dockerfile
FROM gnuoctave/octave:9.2.0

# Create a non-root user to run the code
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner

# Create code directory
RUN mkdir /code && chown coderunner:coderunner /code

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /code

# Command will be provided during container creation
