// server.js - Main API server implementation
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const Docker = require('dockerode');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Allow your web UI server
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/execute', limiter);

// Initialize Docker client
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Supported languages configuration
const supportedLanguages = {
  python: {
    image: 'code-execution-python:latest',
    fileExtension: '.py',
    command: ['python', '/code/script.py']
  },
  javascript: {
    image: 'code-execution-javascript:latest',
    fileExtension: '.js',
    command: ['node', '/code/script.js']
  },
  java: {
    image: 'code-execution-java:latest',
    fileExtension: '.java',
    command: ['bash', '-c', 'cd /code && javac Main.java && java Main']
  },
  cpp: {
    image: 'code-execution-cpp:latest',
    fileExtension: '.cpp',
    // command: ['bash', '-c', 'ls -la /code && echo "Compiling..." && g++ -v -o /code/program /code/main.cpp && echo "Running..." && /code/program']
    command: ['bash', '-c', 'cd /code && g++ -o program main.cpp && ./program']
  },
  ruby: {
    image: 'code-execution-ruby:latest',
    fileExtension: '.rb',
    command: ['ruby', '/code/script.rb']
  },
  go: {
    image: 'code-execution-go:latest',
    fileExtension: '.go',
    command: ['go', 'run', '/code/main.go']
  }
};

// Execution queue - simple in-memory queue for demo purposes
// In production, use a proper queue system like Redis, RabbitMQ, etc.
const executionQueue = [];
const maxConcurrentExecutions = process.env.MAX_CONCURRENT_EXECUTIONS || 5;
let currentExecutions = 0;

// Process queue function
function processQueue() {
  if (executionQueue.length === 0 || currentExecutions >= maxConcurrentExecutions) {
    return;
  }

  currentExecutions++;
  const task = executionQueue.shift();
  executeCode(task.language, task.code, task.input)
    .then(result => {
      task.res.json(result);
    })
    .catch(error => {
      task.res.status(500).json({ error: error.message });
    })
    .finally(() => {
      currentExecutions--;
      processQueue(); // Process next item in queue
    });
}

// Execute code function
async function executeCode(language, code, input = '') {
  // Validate language
  if (!supportedLanguages[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Create a unique execution ID
  const executionId = uuidv4();
  const workDir = path.join('/tmp', executionId);

  try {
    // Create temporary directory for this execution
    await fs.mkdir(workDir, { recursive: true });

    // Determine file name based on language
    const fileName = language === 'java' ? 'Main.java' :
      language === 'cpp' ? 'main.cpp' :
        language === 'go' ? 'main.go' :
          `script${supportedLanguages[language].fileExtension}`;

    // Write code to a file
    const filePath = path.join(workDir, fileName);
    await fs.writeFile(filePath, code);
    console.log(`Created file at: ${filePath}`);

    // Detect if code likely contains interactive input
    const hasInteractiveInput = detectInteractiveCode(language, code);

    // Prepare input file with newlines to ensure it's properly read
    let inputContent = input;
    if (input && !input.endsWith('\n')) {
      inputContent += '\n';
    }

    // Write input to a file if provided
    if (input) {
      await fs.writeFile(path.join(workDir, 'input.txt'), inputContent);
    }

    // Create a temporary Dockerfile to copy the code into the container
    const tempDockerfilePath = path.join(workDir, 'Dockerfile');
    const baseImage = supportedLanguages[language].image;

    // Create a Dockerfile that copies our code into the container
    const dockerfileContent = `
      FROM ${baseImage}
      COPY ${fileName} /code/${fileName}
      ${input ? `COPY input.txt /code/input.txt` : ''}
      USER coderunner
      WORKDIR /code
      `;

    await fs.writeFile(tempDockerfilePath, dockerfileContent);

    // Build a new image for this specific execution
    const tmpImageName = `code-exec-tmp-${executionId}`;

    // Use Docker API to build image
    await new Promise((resolve, reject) => {
      docker.buildImage({
        context: workDir,
        src: ['Dockerfile', fileName, ...(input ? ['input.txt'] : [])]
      }, { t: tmpImageName }, (err, stream) => {
        if (err) return reject(err);

        docker.modem.followProgress(stream, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }, (detail) => {
          if (detail.stream) process.stdout.write(detail.stream);
        });
      });
    });

    console.log(`Built temporary image: ${tmpImageName}`);

    // For interactive code, modify the command to redirect input
    let cmd = [...supportedLanguages[language].command];
    if (hasInteractiveInput && input) {
      // Modify command to pipe input from the file
      if (language === 'java') {
        cmd = ['sh', '-c', 'cd /code && javac Main.java && cat input.txt | java Main'];
      } else if (language === 'cpp') {
        cmd = ['sh', '-c', 'cd /code && g++ -o program main.cpp && cat input.txt | ./program'];
      } else if (language === 'go') {
        // Fix for Go - ensure we're calling the shell correctly
        cmd = ['sh', '-c', 'cat /code/input.txt | go run /code/main.go'];
      } else if (language === 'ruby') {
        cmd = ['sh', '-c', 'cat /code/input.txt | ruby /code/script.rb'];
      } else if (language === 'python') {
        cmd = ['sh', '-c', 'cat /code/input.txt | python /code/script.py'];
      } else if (language === 'javascript') {
        cmd = ['sh', '-c', 'cat /code/input.txt | node /code/script.js'];
      }
    }

    // Set up container options with security constraints
    const containerOptions = {
      Image: tmpImageName,
      Cmd: cmd,
      HostConfig: {
        Memory: 100 * 1024 * 1024,
        MemorySwap: 100 * 1024 * 1024,
        NanoCpus: 1 * 1000000000,
        PidsLimit: 50,
        StopTimeout: 10,
        NetworkMode: 'none',
        Privileged: false,
        SecurityOpt: ['no-new-privileges'],
        CapDrop: ['ALL']
      },
      // Don't use stdin when we're using shell redirection
      OpenStdin: hasInteractiveInput && input && !cmd[0].includes('sh'),
      StdinOnce: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    };

    // Create and start container
    const container = await docker.createContainer(containerOptions);

    // If we have interactive input and we're not using bash redirection
    if (hasInteractiveInput && input && !cmd[0].includes('sh')) {
      const stream = await container.attach({ stream: true, stdin: true, stdout: true, stderr: true });
      stream.write(inputContent);
      stream.end();
    }

    // Start the container
    await container.start();

    // Set timeout for execution (increase for interactive code)
    const timeoutDuration = hasInteractiveInput ? 15000 : 10000;
    const executionTimeout = setTimeout(async () => {
      try {
        console.log(`Execution timeout reached for ${executionId}`);
        const containerInfo = await container.inspect();
        if (containerInfo.State.Running) {
          console.log(`Stopping container for ${executionId} due to timeout`);
          await container.stop();
          console.log(`Container stopped for ${executionId}`);
        }
      } catch (err) {
        console.error('Error stopping container after timeout:', err);
      }
    }, timeoutDuration);

    // Wait for container to finish
    const data = await container.wait();

    // Clear the timeout as execution has completed
    clearTimeout(executionTimeout);

    // Get container logs
    const logs = await container.logs({ stdout: true, stderr: true });

    // Convert buffer to string and separate stdout and stderr
    const output = cleanDockerLogs(logs);

    // Clean up container
    try {
      await container.remove();
    } catch (error) {
      console.error(`Error removing container: ${error.message}`);
      // Continue execution even if container removal fails
    }

    // Remove temporary image
    try {
      await docker.getImage(tmpImageName).remove();
    } catch (err) {
      console.error(`Error removing temporary image: ${err.message}`);
    }

    // Return execution result
    return {
      executionId,
      status: data.StatusCode === 0 ? 'success' : 'error',
      output: output,
      exitCode: data.StatusCode
    };
  } catch (error) {
    console.error(`Error executing code: ${error.message}`);
    throw error;
  } finally {
    // Clean up temporary directory
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Error cleaning up: ${error.message}`);
    }
  }
}

// Add this helper function to clean Docker logs
function cleanDockerLogs(logs) {
  const bufferLogs = Buffer.from(logs);
  let position = 0;
  let cleanedLogs = '';
  
  while (position < bufferLogs.length) {
    // Skip the 8-byte Docker header
    position += 8;
    
    // Find the end of the current log line
    let endOfLine = position;
    while (endOfLine < bufferLogs.length && 
           !(bufferLogs[endOfLine] === 0x01 || bufferLogs[endOfLine] === 0x02) || 
           endOfLine < position + 1) {
      endOfLine++;
    }
    
    // Extract the log line without the header
    const logLine = bufferLogs.slice(position, endOfLine).toString('utf8');
    cleanedLogs += logLine;
    
    // Move position to the next header
    position = endOfLine;
  }
  
  return cleanedLogs;
}

// Add this function to detect if code likely contains interactive input
function detectInteractiveCode(language, code) {
  const patterns = {
    python: /\binput\s*\(/i,
    javascript: /\breadline\b|\bprocess\.stdin\b/i,
    java: /\bScanner\b|\bSystem\.console\(\)|\bBufferedReader\b/i,
    cpp: /\bcin\b|\bgetline\b|\bscanf\b/i,
    ruby: /\bgets\b|\breadline\b/i,
    go: /\bScan\b|\bReader\.ReadString\b|\bReader\.Read\b/i
  };

  return patterns[language] && patterns[language].test(code);
}


// API endpoint to execute code
app.post('/execute', async (req, res) => {
  const { language, code, input } = req.body;

  // Validate request
  if (!language || !code) {
    return res.status(400).json({ error: 'Language and code are required' });
  }

  // Add to queue
  executionQueue.push({ language, code, input, res });

  // Process queue
  processQueue();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// List supported languages
app.get('/languages', (req, res) => {
  res.json(Object.keys(supportedLanguages));
});

// Start server
app.listen(port, () => {
  console.log(`Code execution server listening at http://localhost:${port}`);
});

module.exports = app; // For testing