const SENDGRID_API_KEY = process.env.STRIPE_SECRET_KEY;

module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: SENDGRID_API_KEY,
      },
      settings: {
        defaultFrom: "samir.kabir83@gmail.com",
        defaultReplyTo: "samir.kabir83@gmail.com",
      },
    },
  },
});
