"use strict";

/**
 * A set of functions called "actions" for `stripe`
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.STRIPE_END_POINT_SECRET;

const stripe = require("stripe")(STRIPE_SECRET_KEY);
const emailTemplates = require("./email.js");
const paypal = require("./paypal.js");
const unparsed = require("koa-body/unparsed.js");

module.exports = {
  async webhook(ctx) {
    const body = ctx.request.body[unparsed];
    const signature = ctx.request.headers["stripe-signature"];

    let event;
    let subs;

    try {
      event = await stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      );
    } catch (err) {
      return ctx.badRequest(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;

        subs = module.exports.setSubscriberRoleById(
          checkoutSessionCompleted.client_reference_id,
          checkoutSessionCompleted.customer
        );

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    if (subs) {
      ctx.response.status = 200;
    } else {
      return ctx.badRequest(`Subscription Error: ${subs}`);
    }
  },

  async webhookPayPal(ctx) {
    paypal.payPal(ctx);
  },

  setSubscriberRoleById: async (customerId, customer) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: customerId },
          data: { role: 3, stripeCustomerId: customer },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },

  setSubscriberRoleByEmail: async (email, customer) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { email: email },
          data: { role: 3, stripeCustomerId: customer },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },

  setSubscriberRole: async (ctx) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: ctx.state.user.id },
          data: { role: 3 },
        })
        .then((res) => {
          ctx.response.status = 200;
        });
      ctx.body = entry;
    } catch (err) {
      ctx.body = err;
    }
  },

  createSubscription: async (ctx) => {
    console.log(ctx.state.user.stripeCustomerId);

    ctx.response.status = 200;
  },

  bankPayment: async (ctx) => {
    const email = ctx.state.user.email;

    try {
      await strapi.plugins["email"].services.email.sendTemplatedEmail(
        {
          to: "pbgww.dev@gmail.com",
        },
        emailTemplates.bankEmailTemplate(),
        {
          user: [],
        }
      );
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify("Email send");
    } catch (err) {
      ctx.body = err;
      ctx.badRequest(`Email not send: ${err}`);
    }
  },
};
