"use strict";

/**
 * A set of functions called "actions" for `payment providers`
 */
const paypal = require("./paypal.js");
const stripe = require("./stripe.js");
const bankPayment = require("./bank-payment/bank-payment.js");

module.exports = {
  async webhookStripe(ctx) {
    const response = await stripe.stripe(ctx);

    if (response === undefined) {
      return;
    }

    if (response[0] === 200) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify(
        "Webhook Stripe successfully processed"
      );
    } else if (response[0] === 400) {
      ctx.badRequest(response[1]);
    }
  },

  async webhookPayPal(ctx) {
    const response = await paypal.webhookPayPal(ctx);

    if (response === undefined) {
      return;
    }

    if (response[0] === 200) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify(
        "Webhook - PayPal successfully processed"
      );
    } else if (response[0] === 400) {
      ctx.badRequest(response[1]);
    }
  },

  async bankPayment(ctx) {
    const response = await bankPayment.mail(ctx);

    if (response === undefined) {
      return;
    }

    if (response) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify("Email send");
    } else {
      ctx.badRequest(`Email not send`);
    }
  },

  async customerPortal(ctx) {
    const id = ctx.params.id;

    const response = await stripe.redirectToCustomerPortal(id);

    if (response === undefined) {
      return;
    }

    if (response[0] === 200) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({
        url: response[1],
      });
    } else {
      ctx.badRequest(`Stripe redirect failed`);
    }
  },
};
