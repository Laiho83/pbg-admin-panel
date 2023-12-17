const crypto = require("crypto");

module.exports = ({ env }) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET") || crypto.randomBytes(16).toString("base64"),
      expiresIn: "7d",
    },
  },
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "PrettyBarnGood <info@prettybarngood.com>",
        defaultReplyTo: "info@prettybarngood.com",
      },
    },
  },
});
