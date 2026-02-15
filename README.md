# Code Execution Server

A secure, production-ready, multi-language code execution platform using Docker isolation, a Node.js API, and a browser-based interactive UI.

## Overview

This project executes untrusted code in isolated containers with strict resource and security limits. It supports:

- REST execution (`POST /execute`) for request/response runs
- WebSocket interactive execution (real-time stdin/stdout via Socket.IO)
- Multiple language runtimes (interpreted + compiled)
- Queueing and concurrency control
- Production-oriented safeguards (rate limiting, timeouts, no-network execution containers)

---

## Current Language Support

At the time of writing, this repo supports:

- Python
- JavaScript (Node.js)
- Java
- C++
- C
- Ruby
- Go
- Dart
- PHP
- Rust
- C#
- Scala
- Octave
- Assembly (NASM x86_64)

---

## High-Level Architecture

### Components

1. **Backend API Server**
   - File: `server/server.js`
   - Stack: Express + Socket.IO + Dockerode
   - Responsibilities:
     - Accept execution requests
     - Validate and queue work
     - Orchestrate Docker containers
     - Stream output and accept interactive input

2. **Frontend Web UI**
   - File: `web-ui/index.html`
   - Stack: Bootstrap + CodeMirror + Socket.IO client
   - Responsibilities:
     - Language selection
     - Editor + sample snippets
     - Real-time output rendering
     - Interactive stdin input during execution

3. **Language Runtime Containers**
   - Folder: `languages/<language>/Dockerfile`
   - Responsibilities:
     - Provide language/compiler toolchain
     - Run as non-root user (`coderunner`)

4. **Docker Compose Orchestration**
   - File: `docker-compose.yml`
   - Responsibilities:
     - Build and run API + language images
     - Mount shared work volume for interactive mode
     - Wire network and service lifecycle

5. **Shared Execution Volume**
   - Volume: `code-workdir`
   - Used by interactive runs to avoid per-request image build overhead.

---

## Execution Architecture

There are two execution paths:

## 1) Batch Mode (`POST /execute`)

Flow:

1. Client sends `{ language, code, input? }`.
2. Server validates request and enqueues execution.
3. `executeCode()` creates a unique temp directory under `/tmp/<executionId>`.
4. Server writes source file (language-specific naming: e.g., `Main.java`, `main.cpp`, `script.py`).
5. If input exists, writes `input.txt`.
6. Server generates a tiny temporary Dockerfile (`FROM <base-image>`, `COPY` source/input).
7. Builds a per-execution image.
8. Runs container with strict limits.
9. Collects logs, cleans Docker multiplex headers, sanitizes known benign noise.
10. Returns JSON response with output and exit code.
11. Cleans up temp directory/container/image.

When to use:
- API-based stateless execution
- Non-interactive integrations

## 2) Interactive Mode (Socket.IO)

Flow:

1. Client emits `execute-interactive`.
2. `executeCodeInteractive()` creates `/workdir/<executionId>` in shared volume.
3. Source file is written there.
4. Server starts container from prebuilt language image with `WorkingDir=/workdir/<executionId>`.
5. Attaches stream before start (avoids race on fast exits).
6. Demuxes stdout/stderr and streams chunks to UI in real time.
7. Sends `execution-start` with `executionId`.
8. Client sends input events tagged with `executionId`.
9. Server routes input only to matching execution stream (prevents stale cross-run input writes).
10. On completion/timeout, emits `execution-complete` and cleans up.

When to use:
- Programs that ask for input during execution
- Educational/live coding use cases

---

## Security Model

Execution containers are constrained with Docker `HostConfig`:

- Memory limit (`100MB` default; higher for heavy languages)
- `MemorySwap` fixed to same limit
- CPU cap (`NanoCpus`)
- PID limit (`PidsLimit: 50`)
- `NetworkMode: none` (no outbound internet)
- `Privileged: false`
- `SecurityOpt: ['no-new-privileges']`
- `CapDrop: ['ALL']`
- Timeouts with forced stop

Additional protections:

- Rate limiting on `/execute`
- Request validation (language/code required)
- Non-root runtime users in language images
- Cleanup of temporary artifacts

---

## Concurrency and Queueing

The API server keeps an in-memory queue:

- `executionQueue[]`
- `currentExecutions`
- `MAX_CONCURRENT_EXECUTIONS` env var

Requests are queued and processed FIFO to avoid uncontrolled parallel execution.

> For large-scale production, replace this with Redis/RabbitMQ-backed distributed queueing.

---

## Project Structure

```text
code_execution_server/
├─ docker-compose.yml
├─ server/
│  ├─ Dockerfile
│  ├─ package.json
│  └─ server.js
├─ web-ui/
│  └─ index.html
└─ languages/
   ├─ python/Dockerfile
   ├─ javascript/Dockerfile
   ├─ java/Dockerfile
   ├─ cpp/Dockerfile
   ├─ c/Dockerfile
   ├─ ruby/Dockerfile
   ├─ go/Dockerfile
   ├─ dart/Dockerfile
   ├─ php/Dockerfile
   ├─ rust/Dockerfile
   ├─ csharp/Dockerfile
   ├─ scala/Dockerfile
   ├─ octave/Dockerfile
   └─ assembly/Dockerfile
```

---

## API Reference

## `POST /execute`

Request:

```json
{
  "language": "python",
  "code": "print('Hello')",
  "input": "optional stdin"
}
```

Response:

```json
{
  "executionId": "uuid",
  "status": "success",
  "output": "Hello\n",
  "exitCode": 0
}
```

## `GET /languages`

Returns list of supported language keys.

## `GET /health`

Returns:

```json
{ "status": "UP" }
```

---

## WebSocket Event Reference

Client -> Server:

- `execute-interactive`: `{ language, code }`
- `input`: `{ data, executionId }`

Server -> Client:

- `execution-start`: `{ executionId }`
- `output`: `{ data, type? }` where `type` may be `stderr`
- `execution-complete`: `{ status, exitCode, executionId }`
- `error`: `{ message }`

---

## Setup and Run

## Prerequisites

- Docker + Docker Compose
- Port `3000` available

## Build all images

```bash
docker-compose build
```

## Start services

```bash
docker-compose up -d
```

## Open UI

`http://localhost:3000`

## Logs

```bash
docker-compose logs -f api-server
```

## Stop

```bash
docker-compose down
```

---

## Interactive Execution Guide

This platform supports real-time interactive programs via Socket.IO.

## How to use interactive mode

1. Open `http://localhost:3000`
2. Select a language
3. Click **Run Code (Interactive)**
4. Wait for prompts in output
5. Type input in the interactive field and press Enter (or Send)
6. Use **Stop** to terminate long-running executions

## UI behavior

- Output streams in real time
- Input you send is echoed in the output area
- Stderr is highlighted separately
- Final status shows success/failure with exit code

## Best practices for interactive programs

- Use clear prompts (example: `Enter your name:`)
- Flush output when runtime requires it
- Keep interaction short to avoid timeout
- Handle invalid input in code for better UX

## Typical interactive examples

- Greeting flows (name/age)
- CLI calculators
- Small games (guessing loops)
- Data entry scripts

---

## Production Deployment Guide

## Production readiness checklist

- Input validation and request size limits
- Rate limiting enabled
- Non-root execution containers
- No-new-privileges + dropped capabilities
- Network-disabled execution containers
- CPU/memory/process limits per execution
- Execution timeout enforcement
- Health endpoint (`/health`)
- Queue/concurrency controls

## Recommended environment variables

```env
NODE_ENV=production
PORT=3000
MAX_CONCURRENT_EXECUTIONS=5
CORS_ORIGIN=https://yourdomain.com
```

## Monitoring commands

```bash
# health
curl http://localhost:3000/health

# service logs
docker-compose logs -f api-server

# container status
docker-compose ps

# live resource usage
docker stats
```

## Reverse proxy notes

- Put API behind Nginx/Apache in production
- Terminate TLS at reverse proxy
- Forward websocket upgrade headers
- Set proxy timeout above execution timeout

## Operations

```bash
# rebuild and redeploy
docker-compose build --no-cache
docker-compose up -d

# restart api server only
docker-compose restart api-server

# cleanup old images/volumes (careful)
docker image prune -a
docker volume prune
```

---

## What’s New (Consolidated)

- Real-time interactive execution over WebSocket
- Execution-scoped input routing via `executionId`
- Streaming stdout/stderr demux from Docker
- Expanded multi-language support (including compiled runtimes)
- Output noise reduction for better user-visible I/O

---

## How to Add a New Language (Complete Guide)

Use this checklist for production-ready onboarding.

## Step 1: Create runtime image

Create `languages/<language>/Dockerfile`:

- Install runtime/compiler
- Create non-root `coderunner`
- Create `/code` and assign ownership
- `USER coderunner`
- `WORKDIR /code`

Example shape:

```dockerfile
FROM <base-image>
RUN ... install toolchain ...
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner
RUN mkdir /code && chown coderunner:coderunner /code
USER coderunner
WORKDIR /code
```

## Step 2: Register language in `supportedLanguages`

In `server/server.js`, add entry:

```js
<language>: {
  image: 'code-execution-<language>:latest',
  fileExtension: '.<ext>',
  command: ['<runtime>', '<entry-file>']
}
```

For compiled languages, use compile + run command (prefer `/tmp` build dir if shared volume permissions are strict).

## Step 3: Add filename mapping

If language needs special entry name (`Main.java`, `Program.cs`, etc.), update file naming logic in:

- `executeCode()`
- `executeCodeInteractive()`

Otherwise default `script.<ext>` is enough.

## Step 4: Add interactive stdin detection

Update `detectInteractiveCode(language, code)` with regex for common stdin APIs in that language.

## Step 5: Add stdin piping command (optional but recommended)

In batch mode command overrides (`if (hasInteractiveInput && input)`), add branch for your language so piped input works.

## Step 6: Add Docker Compose service

In `docker-compose.yml`, add:

```yaml
code-execution-<language>:
  build:
    context: ./languages/<language>
    dockerfile: Dockerfile
  image: code-execution-<language>:latest
  restart: "no"
  networks:
    - code-execution-network
```

## Step 7: Add UI support

In `web-ui/index.html`:

- Add `<option value="<language>">...</option>`
- Add sample snippet in `sampleCode`
- Add CodeMirror mode in `languageModes`

## Step 8: Add memory override (if needed)

Heavy runtimes/compilers may need `256MB`+ in memory limit selection logic.

## Step 9: Build and restart

```bash
docker-compose build code-execution-<language> api-server
docker-compose restart api-server
```

## Step 10: Validate

Run at least these tests:

1. Hello world
2. Interactive stdin sample
3. Intentional compile/runtime error
4. Timeout behavior

---

## Troubleshooting

## Permission denied on build artifacts

Compile in `/tmp/<lang>-build` and run output from `/tmp` instead of mounted workdir.

## Runtime tries to download internet dependencies

Execution containers have `NetworkMode: none`; choose offline command path or pre-bake dependencies in image.

## Noisy toolchain logs in UI

Redirect setup/build stdout on success, but preserve stderr/failure logs for diagnostics.

## Interactive input not delivered

Check `executionId` routing between client and server, and verify language stdin detection regex.

---

## Production Notes

- API server currently uses in-memory queue; use external queue for multi-instance scaling.
- Consider stricter CORS origins for production.
- Pin image versions and scan images for vulnerabilities regularly.
- Add persistent observability (metrics/tracing) for enterprise deployments.

---

## License

MIT
