const { app, Deta } = require("deta")
const fetch = require("node-fetch")
require("dotenv").config()

const deta = Deta()
const db = deta.Base("nopbreak")


/*
db.put({
        dev: json.dev.build,
        beta: json.beta.build,
        release: json.release.build
}, "version")
*/


const body = (type) => JSON.stringify({
    username: "TwCatcher",
    avatar_url: "https://cdn.discordapp.com/avatars/985794103985987614/1bc312db9d8441a75e188d2a1d6cf9f3.png?size=4096",
    content: `<@&${process.env.ROLE}> New PurpleTV otachannel!!`,
    embeds: [{
        title: `PurpleTV b${type.build}`,
        description: type.changelog,
        url: type.apkUrl[0],
        image: {
            url: "https://probot.media/kW17yOcBN2.png"
        },
        color: parseInt(type.primaryColor.replace("#", ""), 16),
    }],
    allowed_mentions: {
        roles: [process.env.ROLE]
    }
})

app.lib.cron(async event => {
    const json = await fetch("https://api.nopbreak.ru/orange/update").then(res => res.json())
    const item = await db.get("version")
    if (json.dev.build > item.dev) {
        item.dev = json.dev.build
        db.put(item, "version")
        await fetch(process.env.WEBHOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: body(json.dev).replace("otachannel", "Dev")
        })
    }
    if (json.beta.build > item.beta) {
        item.beta = json.beta.build
        db.put(item, "version")
        await fetch(process.env.WEBHOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: body(json.beta).replace("otachannel", "Beta")
        })
    }
    if (json.release.build > item.release) {
        item.release = json.release.build
        db.put(item, "version")
        await fetch(process.env.WEBHOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: body(json.release).replace("otachannel", "Release")
        })
    }
})

module.exports = app