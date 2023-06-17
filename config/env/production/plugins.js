const crypto = require("crypto");

module.exports = ({ env }) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET") || crypto.randomBytes(16).toString("base64"),
    },
  },
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "pbgww.dev@gmail.com",
        defaultReplyTo: "pbgww.dev@gmail.com",
      },
    },
  },
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "7d",
      },
    },
  },
});
