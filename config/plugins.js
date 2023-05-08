module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey:
          "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",
      },
      settings: {
        defaultFrom: "skabir.dev@gmail.com",
        defaultReplyTo: "skabir.dev@gmail.com",
      },
    },
  },
});
