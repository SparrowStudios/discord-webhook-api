// const fs = require("fs/promises");
// const cors = require("cors");
// const _ = require("lodash");
// const { v4: uuid } = require("uuid");
// const EXPRESS = require("express");


import express from "express";
import Logger from "./modules/logger.js";
import { sendDiscordMessage } from "./modules/utils.js";
import Queue from "./modules/queue.js";


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
    const BODY = req.body;
    // console.log(BODY);

    WEBHOOK_QUEUE.enqueue({
        url: "https://discord.com/api/webhooks/1117662071996289207/D68J146BZw0u5T64uJNUO8w7wIdkmVka3BsWrfBTF1qAfmO3hRmQgWoiVOpzeQ8mJOFw",
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