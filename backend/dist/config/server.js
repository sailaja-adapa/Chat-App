module.exports = ({ env }) => ({
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),
    app: {
        keys: env.array("APP_KEYS", ["a65161737574e7fa5ddcfc72b75c0d0667c0fd71803f9346bbaa7b9b6f7ffe72"]),
    },
    settings: {
        cors: {
            enabled: true,
            origin: ["http://localhost:3000", "https://chat-app-sandy-mu.vercel.app/"], // Add deployed frontend URL
        },
    },
});
