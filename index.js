import express from "express";
import Logger from "./modules/logger.js";
import { sendDiscordMessage } from "./modules/utils.js";
import Queue from "./modules/queue.js";
import * as dotenv from 'dotenv';

dotenv.config();

const APP = express();
const LOGGER = new Logger();
const WEBHOOK_QUEUE = new Queue(async (entry) => {
    await sendDiscordMessage(entry.url, entry.params);
});

APP.use(express.json());

LOGGER.runLogger();
setInterval(async () => {
    if (WEBHOOK_QUEUE.length > 0) { await WEBHOOK_QUEUE.processQueue(); }
}, 2500)

APP.listen(3000, () => {
    LOGGER.ready("API server is running.")
});



APP.post("/workflow/success", async (req, res) => {
    const BODY = { ...req.body };
    const PRINT_BODY = { ...BODY };
    PRINT_BODY.actorAvatarUrl = `<${BODY.actorAvatarUrl}>`;

    LOGGER.action(`Received post on /workflow/success for commit "${BODY.commitMessage}" on branch "${BODY.branchName}" from "${BODY.actorName}"`);
    LOGGER.log(`Processing body: "${JSON.stringify(PRINT_BODY)}"`);

    LOGGER.log(`Enqueued webhook`);
    WEBHOOK_QUEUE.enqueue({
        url: process.env.WEBHOOK_REPO_UPDATE,
        params: {
            "username": "GitHub",
            "avatar_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            "content": "",
            "tts": false,
            "embeds": [{
                "id": 310566318,
                "fields": [{
                    "id": 933641836,
                    "name": "Branch",
                    "value": BODY.branchName,
                    "inline": true
                }, {
                    "id": 8469395,
                    "name": "Commit",
                    "value": BODY.commitMessage,
                    "inline": true
                }],
                "author": {
                    "name": BODY.actorName,
                    "icon_url": BODY.actorAvatarUrl
                },
                "title": `Workflow number #${BODY.runNumber} has passed in ${BODY.runTime}`,
                "timestamp": BODY.timestamp,
                "footer": {
                    "text": BODY.repoName
                },
                "color": 4194048
            }],
            "components": [],
            "actions": {}
        }
    })

    res.sendStatus(200);
});

APP.post("/workflow/failure", async (req, res) => {
    const BODY = req.body;
    const PRINT_BODY = BODY;
    PRINT_BODY.actorAvatarUrl = `<${BODY.actorAvatarUrl}>`;
    
    LOGGER.action(`Received post on /workflow/failure for commit "${BODY.commitMessage}" on branch "${BODY.branchName}" from "${BODY.actorName}"`);
    LOGGER.log(`Processing body: "${JSON.stringify(PRINT_BODY)}"`);

    LOGGER.log(`Enqueued webhook`);
    WEBHOOK_QUEUE.enqueue({
        url: process.env.WEBHOOK_REPO_UPDATE,
        params: {
            "username": "GitHub",
            "avatar_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            "content": "",
            "tts": false,
            "embeds": [{
                "id": 310566318,
                "fields": [{
                    "id": 933641836,
                    "name": "Branch",
                    "value": BODY.branchName,
                    "inline": true
                }, {
                    "id": 8469395,
                    "name": "Commit",
                    "value": BODY.commitMessage,
                    "inline": true
                }],
                "author": {
                    "name": BODY.actorName,
                    "icon_url": BODY.actorAvatarUrl
                },
                "title": `Workflow number #${BODY.runNumber} has failed in ${BODY.runTime}`,
                "timestamp": BODY.timestamp,
                "footer": {
                    "text": BODY.repoName
                },
                "color": E53631
            }],
            "components": [],
            "actions": {}
        }
    })

    res.sendStatus(200);
});