import { writeFile } from "node:fs";
import { sendDiscordMessage } from "../modules/utils.js";
import Queue from "../modules/queue.js";

export default class Logger {
    #logQueue;

    constructor() {
        this.#logQueue = new Queue(async (entry) => {
            console.log(entry.logMessage);
            await this.#sendToDiscord(entry);

            // switch(entry.type) {
            //     case "debug":
            //         writeFile("./logs/master.log", "\n" + entry.logMessage, { flag: 'a+' }, err => {}); 
            //         break;
            //     case "log":
            //     case "ready": 
            //         writeFile(`./logs/dates/${entry.date}.log`, "\n" + entry.logMessage, { flag: 'a+' }, err => {}); 
            //         writeFile("./logs/master.log", "\n" + entry.logMessage, { flag: 'a+' }, err => {}); 
            //         break;
            //     case "warn": 
            //     case "error": 
            //         writeFile(`./logs/dates/${entry.date}.log`, "\n" + entry.logMessage, { flag: 'a+' }, err => {}); 
            //         writeFile("./logs/master.log", "\n" + entry.logMessage, { flag: 'a+' }, err => {}); 
            //         writeFile("./logs/error.log", "\n" + entry.logMessage, { flag: 'a+' }, err => {}); 
            //         break;
            //     case "action": 
            //         writeFile(`./logs/dates/${entry.date}.log`, "\n" + entry.logMessage, { flag: 'a+' }, err => {}); 
            //         writeFile("./logs/master.log", "\n" + entry.logMessage, { flag: 'a+' }, err => {}); 
            //         writeFile("./logs/action.log", "\n" + entry.logMessage, { flag: 'a+' }, err => {}); 
            //         break;
            //     default: 
            //         throw new TypeError("Logger type must be either warn, debug, log, ready, cmd or error.");
            // }
        });
    }

    runLogger() {
        setInterval(async () => {
            if (this.#logQueue.length > 0) { await this.#logQueue.processQueue(); }
        }, 2500)
    }

    async #sendToDiscord(entry) {
        if (entry.type === "debug") { return; }
        const URL = process.env.WEBHOOK_API_LOGS;
        let logEmoji = "";

        switch (entry.type) {
            case "ready": logEmoji = "🟢"; break;
            case "warn": logEmoji = "⚠️"; break;
            case "error": logEmoji = "🛑"; break;
            case "action": logEmoji = "🔵"; break;
            default: logEmoji = "⚪"; break;
        }

        await sendDiscordMessage(URL, {
            username: "API Logger",
            avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP2MsAfQAdOz7kBaXIqVysnCHlgHYgA5ig1g&usqp=CAU",
            content: `${logEmoji} ${entry.logMessage}`
        });
    }

    /**
     * @function
     * @name log
     * @param {String} content content to log to console
     * @param {String} type the type you want the log to take, (log, warn, error, debug, cmd, ready, action)
     * @description Core to the log function
     */
    log(content, type = "log") {
        const entry = {
            date: `${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, "-")}`,
            timestamp: `[${new Date().toLocaleDateString('en-US', { timeZoneName: 'longOffset', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, "-").replace(/,/g, "")}]`,
            type: type,
            message: content
        }

        entry["logMessage"] = `${entry["timestamp"]} | ${entry["type"].toUpperCase()} | ${entry["message"]}`
        
        this.#logQueue.enqueue(entry)
    }

    /**
     * @function
     * @name error
     * @param  {String} content content to log
     * @see {@link Logger.log}
     * @description Send a message to the console with fomating for an error.
     */
    error(...content) { this.log(content, "error")}

    /**
     * @function
     * @name warn
     * @param  {String} content content to log
     * @see {@link Logger.log}
     * @description Send a message to the console with fomating for a warnning.
     */
    warn(...content) { this.log(content, "warn")}

    /**
     * @function
     * @name debug
     * @param  {String} content content to log
     * @see {@link Logger.log}
     * @description Send a message to the console with fomating for a debug message.
     */
    debug(...content) { this.log(content, "debug")}

    /**
     * @function
     * @name ready
     * @param  {String} content content to log
     * @see {@link Logger.log}
     * @description Send a message to the console with fomating for a ready log.
     */
    ready(...content) { this.log(content, "ready")}

    /**
     * @function
     * @name action
     * @param  {String} content content to log
     * @see {@link Logger.log}
     * @description Send a message to the console with fomating for an action.
     */
    action(...content) { this.log(content, "action")}
}