const SENDGRID_API_KEY = process.env.STRIPE_SECRET_KEY;

module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey:
          "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",
      },
      settings: {
        defaultFrom: "samir.kabir83@gmail.com",
        defaultReplyTo: "samir.kabir83@gmail.com",
      },
    },
  },
});
