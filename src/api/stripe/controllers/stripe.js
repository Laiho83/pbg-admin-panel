"use strict";

/**
 * A set of functions called "actions" for `stripe`
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PRICE_ID_ONE_MONTH = process.env.PRICE_ID_ONE_MONTH;
const endpointSecret =
  "whsec_f4f1a11d8dcea0dc2b548c7647df5328e0132c1f63341ebb09e9f634ead666b6";

const stripe = require("stripe")(STRIPE_SECRET_KEY);

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

        subs = module.exports.setSubscriberRoleByEmail(
          checkoutSessionCompleted.customer_email
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

  setSubscriberRoleByEmail: async (email) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { email: email },
          data: { role: 3 },
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

  createCustomer: async (ctx) => {
    let customer;

    try {
      customer = await stripe.customers
        .create({
          email: ctx.state.user.email,
          name: ctx.request.body["name"],
        })
        .then(async (res) => {
          await strapi.query("plugin::users-permissions.user").update({
            where: { id: ctx.state.user.id },
            data: { stripeCustomerId: res.id },
          });

          ctx.body = 200;
        });
    } catch (err) {
      return res.status(400).send({ error: { message: error.message } });
    }
  },

  updateStrapiCustomer: async (stripeCustomerId) => {
    console.log("Customer: ", customer.id);

    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: ctx.state.user.id },
          data: { stripeCustomerId },
        })
        .then((res) => {
          ctx.response.status = 200;
        });
      ctx.body = entry;
    } catch (err) {
      ctx.body = err;
    }
  },

  updateStrapiCustomer: async (stripeCustomerId) => {
    console.log("Customer: ", customer.id);

    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: ctx.state.user.id },
          data: { stripeCustomerId },
        })
        .then((res) => {
          ctx.response.status = 200;
        });
      ctx.body = entry;
    } catch (err) {
      ctx.body = err;
    }
  },

  exampleAction: async (ctx) => {
    ctx.response.status = 200;
  },
};
