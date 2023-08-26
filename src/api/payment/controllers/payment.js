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

    if (response[0] === 200) {
      return (ctx.response.status = 200);
    } else if (response[0] === 400) {
      ctx.badRequest(response[1]);
    }
  },

  async webhookPayPal(ctx) {
    const response = await paypal.payPal(ctx);

    if (response) {
      ctx.response.status = 200;
    } else {
      return ctx.badRequest(`Subscription Error: ${subs}`);
    }
  },

  async bankPayment(ctx) {
    const response = await bankPayment.mail(ctx);

    if (response) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify("Email send");
    } else {
      ctx.body = err;
      ctx.badRequest(`Email not send: ${err}`);
    }
  },
};
