# Interactive Code Execution Guide

## 🎯 Overview

Your code execution platform now supports **real-time interactive input**! Users can type and send input while their code is running, making it perfect for programs that require user interaction.

## ✨ New Features

### 1. **Real-Time Streaming Output**
- Output appears instantly as your code executes
- No waiting until completion to see results
- Visual feedback shows execution progress

### 2. **Interactive Input**
- Type input directly when your code asks for it
- Press Enter or click "Send" to submit
- Input appears in the output window for reference

### 3. **Execution Control**
- **Stop Button**: Terminate execution at any time
- **Visual Indicators**: Output box changes color during execution
- **Status Messages**: Clear feedback on execution state

### 4. **Multi-Language Support**
All 6 languages support interactive input:
- Python
- JavaScript (Node.js)
- Java
- C++
- Ruby
- Go

## 🚀 How to Use

### Step 1: Write Interactive Code

Open http://localhost:3000 and write code that asks for input.

**Python Example:**
```python
name = input("What's your name? ")
print(f"Hello, {name}!")

age = input("How old are you? ")
print(f"You are {age} years old!")
```

**JavaScript Example:**
```javascript
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('What is your name? ', name => {
  console.log(`Hello, ${name}!`);

  readline.question('What is your favorite color? ', color => {
    console.log(`${color} is a great color!`);
    readline.close();
  });
});
```

**Java Example:**
```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");

        System.out.print("Enter a number: ");
        int num = scanner.nextInt();
        System.out.println("Your number squared is: " + (num * num));

        scanner.close();
    }
}
```

**C++ Example:**
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;

    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Hello, " << name << "!" << endl;

    cout << "Enter your age: ";
    cin >> age;
    cout << "You are " << age << " years old!" << endl;

    return 0;
}
```

**Ruby Example:**
```ruby
puts "What's your name?"
name = gets.chomp
puts "Hello, #{name}!"

puts "What's your favorite programming language?"
language = gets.chomp
puts "#{language} is awesome!"
```

**Go Example:**
```go
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

func main() {
    reader := bufio.NewReader(os.Stdin)

    fmt.Print("Enter your name: ")
    name, _ := reader.ReadString('\n')
    name = strings.TrimSpace(name)
    fmt.Printf("Hello, %s!\n", name)

    fmt.Print("Enter your age: ")
    age, _ := reader.ReadString('\n')
    age = strings.TrimSpace(age)
    fmt.Printf("You are %s years old!\n", age)
}
```

### Step 2: Click "Run Code (Interactive)"

The execution starts immediately and the UI changes:
- Output box gets a blue border
- Interactive input field appears below
- Stop button becomes available

### Step 3: Provide Input

When your code asks for input:
1. Type your response in the input field
2. Press **Enter** or click **Send**
3. The input appears in the output
4. Your code receives the input and continues

### Step 4: View Results

- Output streams in real-time
- Status messages show execution state
- Final result indicates success or error

## 🎨 UI Features

### Output Display

```
⏳ Building execution environment...
🚀 Starting execution...

What's your name?
Alice                          ← Your input appears here
Hello, Alice!
How old are you?
25                             ← Your input appears here
You are 25 years old!

✅ Execution completed successfully
```

### Interactive Input Field

- **Placeholder**: "Type input and press Enter..."
- **Auto-focus**: Ready for typing
- **Enter Key**: Submit input quickly
- **Send Button**: Alternative submission method

### Visual Feedback

- **Running**: Blue border on output box
- **Errors**: Red text for stderr output
- **Status**: Green checkmark (✅) or red X (❌)

## 🛠️ Technical Details

### WebSocket Communication

The platform uses **Socket.IO** for real-time bidirectional communication:

```javascript
// Connection established
socket.on('connect', () => { ... });

// Receive output stream
socket.on('output', (data) => { ... });

// Send input to program
socket.emit('input', { data: inputValue });

// Execution complete
socket.on('execution-complete', (data) => { ... });
```

### Streaming Architecture

1. **Client** sends execution request via WebSocket
2. **Server** creates isolated Docker container
3. **Output** streams back to client in real-time
4. **Input** sent from client to container stdin
5. **Completion** triggers cleanup and status update

### Security Features

All existing security features remain active:
- Container isolation
- Resource limits (100MB RAM, 1 CPU)
- Network disabled
- 15-second timeout
- Non-root execution

## 🔍 Troubleshooting

### Input Not Working

**Problem**: Code doesn't receive input

**Solutions**:
1. Ensure you're using the interactive input field (below output)
2. Press Enter after typing
3. Check that your code is actually waiting for input
4. Look for prompts in the output

### Output Not Streaming

**Problem**: Output appears all at once at the end

**Solutions**:
1. Refresh the page to reconnect WebSocket
2. Check browser console for connection errors
3. Ensure Socket.IO is loaded (check browser network tab)

### Execution Hangs

**Problem**: Code doesn't complete

**Solutions**:
1. Click the **Stop** button
2. Check if code is waiting for input you haven't provided
3. Look for infinite loops in your code
4. Note: 15-second timeout will auto-stop execution

### Connection Issues

**Problem**: "Disconnected from server" message

**Solutions**:
1. Refresh the page
2. Check that server is running: `docker-compose ps`
3. Verify Socket.IO port is accessible
4. Check server logs: `docker-compose logs -f api-server`

## 📊 Comparison: Before vs After

### Before (Static Input)
```
❌ All input must be provided before execution
❌ No visibility until completion
❌ Can't interact with running program
❌ Confusing for beginners
```

### After (Interactive Input)
```
✅ Type input when program asks
✅ See output in real-time
✅ Natural program interaction
✅ Better learning experience
```

## 🎓 Example Use Cases

### 1. **Educational Programs**
```python
# Math quiz
score = 0
for i in range(3):
    answer = input(f"What is {i+1} + {i+2}? ")
    if int(answer) == i+1 + i+2:
        print("Correct!")
        score += 1
    else:
        print("Wrong!")

print(f"Final score: {score}/3")
```

### 2. **Data Processing**
```python
# CSV data entry
data = []
while True:
    name = input("Enter name (or 'done' to finish): ")
    if name.lower() == 'done':
        break
    age = input("Enter age: ")
    data.append({'name': name, 'age': age})

print(f"Collected {len(data)} entries:")
for entry in data:
    print(f"  {entry['name']}: {entry['age']} years old")
```

### 3. **Games**
```python
import random

number = random.randint(1, 100)
attempts = 0

print("Guess the number between 1 and 100!")

while True:
    guess = int(input("Your guess: "))
    attempts += 1

    if guess < number:
        print("Too low!")
    elif guess > number:
        print("Too high!")
    else:
        print(f"Correct! You won in {attempts} attempts!")
        break
```

## 🚀 Advanced Features

### Multiple Inputs
Handle programs with multiple sequential inputs:
```python
username = input("Username: ")
password = input("Password: ")
email = input("Email: ")

print(f"Account created for {username}")
print(f"Confirmation sent to {email}")
```

### Input Validation
Programs can validate and re-request input:
```python
while True:
    age = input("Enter your age (1-120): ")
    if age.isdigit() and 1 <= int(age) <= 120:
        break
    print("Invalid age! Try again.")

print(f"Age {age} is valid!")
```

### Error Handling
Gracefully handle invalid input:
```python
try:
    number = int(input("Enter a number: "))
    print(f"You entered: {number}")
except ValueError:
    print("That's not a valid number!")
```

## 📝 Best Practices

### 1. **Clear Prompts**
```python
# Good
name = input("Enter your full name: ")

# Bad
name = input()  # User doesn't know what to enter
```

### 2. **Immediate Feedback**
```python
# Good
choice = input("Select option (1-3): ")
print(f"You selected option {choice}")

# Bad
choice = input("Select option: ")
# ... lots of processing before feedback
```

### 3. **Graceful Timeouts**
```python
# Keep input requests reasonable
# The entire execution times out after 15 seconds
```

### 4. **Visual Indicators**
```python
print("=== Starting Calculator ===")
num1 = input("Enter first number: ")
num2 = input("Enter second number: ")
print(f"Result: {int(num1) + int(num2)}")
print("=== Calculation Complete ===")
```

## 🎉 Try It Now!

1. Open http://localhost:3000
2. Select a language
3. Write code that asks for input
4. Click "Run Code (Interactive)"
5. Type responses when prompted
6. See real-time results!

Your code execution platform is now fully interactive! 🚀
