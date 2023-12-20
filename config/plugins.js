module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: process.env.SENDGRID_API_KEY,
      },
      settings: {
        defaultFrom: "PrettyBarnGood <pbgww.dev@gmail.com>",
        defaultReplyTo: "pbgww.dev@gmail.com",
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
