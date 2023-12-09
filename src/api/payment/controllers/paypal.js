const unparsed = require("koa-body/unparsed.js");
const fetch = require("node-fetch");

const paymentService = require("../services/payment.service");

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const APP_SECRET = process.env.PAYPAL_APP_SECRET;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

const baseURL = {
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
};

module.exports = {
  async webhookPayPal(ctx) {
    const body = ctx.request.body;
    const token = await module.exports.generateAccessToken();
    const verification_status = await module.exports.webhookSignature(
      ctx,
      token
    );

    if (verification_status !== "SUCCESS") {
      return;
    }

    switch (body.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        try {
          await module.exports.payPalSubscriptionActivated(body.resource);
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }

      case "BILLING.SUBSCRIPTION.UPDATED":
        try {
          await module.exports.payPalSubscriptionUpdated(body.resource);
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        try {
          await module.exports.payPalSubscriptionSuspended(body.resource);
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }

      case "BILLING.SUBSCRIPTION.CANCELLED":
        try {
          await module.exports.payPalSubscriptionCancelled(body.resource);
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }

      default:
        return [];
    }
  },

  /**
   * Sets PayPal first subscription creation
   * Role: 3 - subscriber, 1 - Authenticated
   */
  async payPalSubscriptionActivated(event) {
    paymentService.setPayPalSubscriptionCreatedAndUpdate(event);
    // console.log("ACTIVATED");
    // console.log(event);
  },

  /**
   * Sets PayPal payment field on update (renewel, delete, ...)
   * Role: 3 - subscriber, 1 - Authenticated
   */
  async payPalSubscriptionUpdated(event) {
    paymentService.setPayPalSubscriptionCreatedAndUpdate(event);
    // console.log("UPDATED");
    // console.log(event);
  },

  /**
   * Suspendes subscription, so it does not delete it from paypal, it can be renewed
   * Role: 3 - subscriber, 1 - Authenticated
   */
  async payPalSubscriptionSuspended(event) {
    paymentService.setPayPalSubscriptionDeleted(event);
    // console.log("SUSPENDED");
    // console.log(event);
  },

  /**
   * Deleted subscription - deletes from paypal can't renew
   * Role: 3 - subscriber, 1 - Authenticated
   */
  async payPalSubscriptionCancelled(event) {
    paymentService.setPayPalSubscriptionDeleted(event);
    // console.log("CANCELLED");
    // console.log(event);
  },

  /**
   * PayPal validation methods
   */

  // Generate access token
  async generateAccessToken() {
    const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");

    try {
      const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      const data = await response.json();
      return data.access_token;
    } catch (err) {
      console.log(err);
    }
  },

  // Validating with API request - PayPal webhook
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
      return data.verification_status;
    } catch (err) {
      console.log(err);
    }
  },

  // Validate IPN message
  async validate(body) {
    const baseUrl = "https://ipnpb.paypal.com/cgi-bin/webscr";

    let postreq = `cmd=_notify-validate&${body}`;

    const options = {
      method: "POST",
      headers: {
        "Content-Length": postreq.length,
      },
      body: postreq,
    };

    try {
      let response = await fetch(baseUrl, options);

      return response;
    } catch (err) {
      console.log(err);
    }
  },
};
