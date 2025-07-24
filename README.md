# Weekly AI Meeting – Console Log Analyzer Demo

This project demonstrates how to capture, analyze, and summarize browser console logs using Node.js and Chrome's remote debugging protocol. The workflow is designed to generate a variety of logs, capture them, and then leverage an AI tool to analyze the results.

## Step-by-Step Showcase

### 1. Start Chrome with Remote Debugging

Run the following command in your terminal:

```sh
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"
```

**What this does:**
- Launches Google Chrome with the remote debugging protocol enabled on port 9222.
- This allows external tools (like our Node.js script) to connect and capture console logs from any open tab.

### 2. Start the Log Capture Node App

In a separate terminal, run:

```sh
npm install
npm start
```

- `npm install` ensures all dependencies (notably `chrome-remote-interface`) are installed.
- `npm start` runs `get-logs.js`, which connects to Chrome and writes all console logs to `console-logs.txt` in real time.
- You should see `Connected. Capturing console logs...` if the connection is successful.

### 3. Interact with the Test Page

1. Open `test-logs.html` in your Chrome browser (the one started with remote debugging).
2. Use the various buttons at the top of the page to trigger different types of console logs (log, error, warn, info, table, group, assert, count, time, etc.).
3. You can also refresh the page or interact with the script-generated logs to produce more output.

**Goal:**
- Generate a diverse set of logs (including errors and warnings) for analysis.

### 4. Stop the Application and Analyze the Logs

1. When finished, stop the Node.js app (press `Ctrl+C` in the terminal where it's running).
2. The captured logs will be in `console-logs.txt`.
3. Feed this file to your AI tool of choice and ask it to:
   - Analyze the console output.
   - Identify and summarize the most critical errors or warnings.
   - Provide a clear, concise summary 
     ````
        Based on the attached file with the logs of my application, do the following steps:
        1. Rank the errors and warnings by severity and frequency. 
        2. Detect any patterns or trends in the errors or warnings over time.
        3. Based on the logs, what are your top recommendations for improving the application’s stability?
        Be concise. Present a table for a better visualization.
    ```
---

**Tip:**
- You can repeat steps 3 and 4 as many times as you like to generate different log scenarios and test the AI's analysis capabilities.

