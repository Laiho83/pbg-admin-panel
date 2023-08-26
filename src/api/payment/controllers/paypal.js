const http = require("http");
const unparsed = require("koa-body/unparsed.js");
var fetch = require("node-fetch");

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const APP_SECRET = process.env.PAYPAL_APP_SECRET;

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

const baseURL = {
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
};

module.exports = {
  async payPal(ctx) {
    const body = JSON.parse(ctx.request.body[unparsed]);
    const token = await module.exports.generateAccessToken();

    await module.exports.webhookSignature(ctx, token);

    ctx.response.status = 200;
  },

  async generateAccessToken() {
    const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");

    const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  },

  async webhookSignature(ctx, auth) {
    try {
      let response = await fetch(
        `${baseURL.sandbox}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          body: JSON.stringify({
            transmission_id: ctx.request.header["paypal-transmission-id"],
            transmission_time: ctx.request.header["paypal-transmission-time"],
            cert_url: ctx.request.header["paypal-cert-url"],
            auth_algo: ctx.request.header["paypal-auth-algo"],
            transmission_sig: ctx.request.header["paypal-transmission-sig"],
            webhook_id: PAYPAL_WEBHOOK_ID,
            webhook_event: ctx.request.body,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  },
};
