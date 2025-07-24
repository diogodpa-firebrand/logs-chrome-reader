const CDP = require("chrome-remote-interface")
const fs = require("fs")

CDP(async client => {
    const { Runtime } = client
    await Runtime.enable()

    const logStream = fs.createWriteStream("console-logs.txt", { flags: "a" })

    Runtime.consoleAPICalled(({ type, args }) => {
        const message = args.map(a => a.value).join(" ")
        const timestamp = new Date().toISOString()
        logStream.write(`[${type}] ${timestamp} ${message}\n`)
    })

    console.log("Connected. Capturing console logs...")
}).on("error", err => {
    console.error("CDP connection error:", err)
})
