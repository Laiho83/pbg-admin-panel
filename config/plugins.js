module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "skabir.dev@gmail.com",
        defaultReplyTo: "skabir.dev@gmail.com",
      },
    },
  },
  // ...
});
