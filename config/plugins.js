module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: process.env.SENDGRID_API_KEY,
      },
      settings: {
        defaultFrom: "PrettyBarnGood <info@prettybarngood.com>",
        defaultReplyTo: "info@prettybarngood.com",
      },
    },
  },

  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "30d",
      },
    },
  },
});
