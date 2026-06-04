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

app.command("/dari-love", async ({ command, ack, respond }) => {
    await ack();

    const recipient = command.text?.trim();

    if (!recipient) {
        await respond({
            response_type: "in_channel",
            text: "Please include who the message is for, like: `/dari-love Sam`" });
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
        await respond({
            response_type: "in_channel",
            text: message });
    } catch (error) {
        console.error(error);
        await respond({
            text: "Sorry, I couldn't generate a loving message right now." });
    }
});

app.command("/dari-roulette", async ({ command, ack, respond }) => {
    await ack();

    const userChoice = command.text?.trim().toLowerCase();

    if (userChoice !== "red" && userChoice !== "black") {
        await respond({ text: "Choose one: `/dari-roulette red` or `/dari-roulette black`" });
        return;
    }

    const winningColor = Math.random() < 0.5 ? "red" : "black";
    const isWin = userChoice === winningColor;

    await respond({
        text: isWin
            ? `It landed on ${winningColor}. You win!`
            : `It landed on ${winningColor}. You lose!`
    });
});

app.command("/dari-explain", async ({ command, ack, respond }) => {
    await ack();

    const topic = command.text?.trim();

    if (!topic) {
        await respond({ text: "Please provide a topic to explain, like: `/dari-explain quantum computing`" });
        return;
    }

    try {
        const result = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "Provide a clear, concise explanation suitable for Slack. Keep it under 500 characters."
                },
                {
                    role: "user",
                    content: `Explain: ${topic}`
                }
            ]
        });

        const explanation = result.choices?.[0]?.message?.content?.trim() || "Unable to generate explanation.";
        await respond({
            response_type: "in_channel",
            text: explanation });
    } catch (error) {
        console.error(error);
        await respond({ text: "Sorry, I couldn't explain that right now." });
    }
});

(async () => {
    await app.start();
    console.log("bot is running!");
})();
