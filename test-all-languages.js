// Test script to verify all languages work
const io = require('socket.io-client');

const tests = [
  {
    name: 'Python',
    language: 'python',
    code: 'print("Hello from Python")'
  },
  {
    name: 'JavaScript',
    language: 'javascript',
    code: 'console.log("Hello from JavaScript")'
  },
  {
    name: 'Java',
    language: 'java',
    code: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java");\n  }\n}'
  },
  {
    name: 'C++',
    language: 'cpp',
    code: '#include <iostream>\nint main() {\n  std::cout << "Hello from C++" << std::endl;\n  return 0;\n}'
  },
  {
    name: 'Ruby',
    language: 'ruby',
    code: 'puts "Hello from Ruby"'
  },
  {
    name: 'Go',
    language: 'go',
    code: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello from Go")\n}'
  }
];

async function testLanguage(test) {
  return new Promise((resolve) => {
    const socket = io('http://localhost:3000');
    let output = '';
    let status = '';
    const startTime = Date.now();

    socket.on('connect', () => {
      console.log(`\n[${test.name}] Testing...`);
      socket.emit('execute-interactive', {
        language: test.language,
        code: test.code
      });
    });

    socket.on('output', (data) => {
      output += data.data;
    });

    socket.on('execution-complete', (result) => {
      const duration = Date.now() - startTime;
      status = result.status;
      socket.disconnect();

      console.log(`[${test.name}] Status: ${status}`);
      console.log(`[${test.name}] Duration: ${duration}ms`);
      console.log(`[${test.name}] Output: ${output.trim()}`);

      resolve({
        name: test.name,
        status,
        duration,
        output: output.trim(),
        success: status === 'success' && output.includes('Hello from')
      });
    });

    socket.on('error', (error) => {
      console.error(`[${test.name}] Error:`, error);
      socket.disconnect();
      resolve({
        name: test.name,
        status: 'error',
        error: error.message,
        success: false
      });
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (socket.connected) {
        console.log(`[${test.name}] TIMEOUT after 30s`);
        socket.disconnect();
        resolve({
          name: test.name,
          status: 'timeout',
          success: false
        });
      }
    }, 30000);
  });
}

async function runAllTests() {
  console.log('========================================');
  console.log('Testing All Languages');
  console.log('========================================');

  const results = [];
  for (const test of tests) {
    const result = await testLanguage(test);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between tests
  }

  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  results.forEach(r => {
    const icon = r.success ? '✓' : '✗';
    console.log(`${icon} ${r.name}: ${r.status} ${r.duration ? `(${r.duration}ms)` : ''}`);
  });

  const allPassed = results.every(r => r.success);
  console.log(`\nResult: ${allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'}`);
  process.exit(allPassed ? 0 : 1);
}

// Wait 5 seconds for server to be ready
setTimeout(runAllTests, 5000);
