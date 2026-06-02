require("dotenv").config();

const { App } = require("@slack/bolt");
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true
});

app.command("/dsb-love", async ({ command, ack, respond }) => {
    await ack();

    const recipient = command.text?.trim();

    if (!recipient) {
        await respond({ text: "Please include who the message is for, like: `/dsb-love Sam`" });
        return;
    }

    try {
        const result = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "Write one short, warm, loving message. Keep it simple, sweet, and heartfelt."
                },
                {
                    role: "user",
                    content: `Write a loving message directed to ${recipient}.`
                }
            ]
        });

        const message = result.choices?.[0]?.message?.content?.trim() || `Sending love to ${recipient}!`;
        await respond({ text: message });
    } catch (error) {
        console.error(error);
        await respond({ text: "Sorry, I couldn't generate a loving message right now." });
    }
});

(async () => {
    await app.start();
    console.log("bot is running!");
})();