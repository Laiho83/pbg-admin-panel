"use strict";

/**
 * A set of functions called "actions" for `stripe`
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PRICE_ID_ONE_MONTH = process.env.PRICE_ID_ONE_MONTH;

const stripe = require("stripe")(STRIPE_SECRET_KEY);

module.exports = {
  exampleAction: async (ctx) => {},

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
    const customerId = ctx.state.user.stripeCustomerId;

    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: PRICE_ID_ONE_MONTH,
          },
        ],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });
      res.send({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } catch (err) {
      return res.status(400).send({ error: { message: error.message } });
    }
  },

  createCustomer: async (ctx) => {
    let customer;

    try {
      customer = await stripe.customers
        .create({
          email: ctx.state.user.email,
          name: "Test_1",
        })
        .then(async (res) => {
          return await strapi.query("plugin::users-permissions.user").update({
            where: { id: ctx.state.user.id },
            data: { stripeCustomerId: res.id },
          });
        });
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
};
