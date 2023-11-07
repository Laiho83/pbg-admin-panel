const PAYPAL_PLAN_MONTHLY = process.env.PAYPAL_PLAN_MONTHLY;
const PAYPAL_PLAN_SIXMONTH = process.env.PAYPAL_PLAN_SIXMONTH;
const PAYPAL_PLAN_TWELVEMONTH = process.env.PAYPAL_PLAN_TWELVEMONTH;

const STRIPE_PLAN_MONTHLY = process.env.STRIPE_PLAN_MONTHLY;
const STRIPE_PLAN_SIXMONTH = process.env.STRIPE_PLAN_SIXMONTH;
const STRIPE_PLAN_TWELVEMONTH = process.env.STRIPE_PLAN_TWELVEMONTH;

module.exports = {
  setStripeSubscriberRoleById: async (checkoutSessionCompleted) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: checkoutSessionCompleted.client_reference_id },
          data: {
            role: 3,
            stripeCustomerId: checkoutSessionCompleted.customer,
            payment: JSON.stringify(
              module.exports.customerStripeModel(checkoutSessionCompleted)
            ),
          },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },

  updateStripeSubscriberRoleByCustomerId: async (id, role, data) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { stripeCustomerId: id },
          data: {
            role: role,
            payment: JSON.stringify(data),
          },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },

  setPayPalSubscriberRoleById: async (checkoutSessionCompleted) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: checkoutSessionCompleted.custom_id },
          data: {
            role: 3,
            payment: JSON.stringify(
              module.exports.customerPayPalModel(checkoutSessionCompleted)
            ),
          },
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

  customerStripeModel(checkoutSessionCompleted) {
    console.log(checkoutSessionCompleted);
    return {
      provider: "stripe",
      stripeCustomerId: checkoutSessionCompleted.customer,
      stripeEmail: checkoutSessionCompleted.customer_details.email,
      subscription: {
        id: checkoutSessionCompleted.subscription,
        type: {
          oneMonth:
            checkoutSessionCompleted.amount_total == STRIPE_PLAN_MONTHLY,
          sixMonth:
            checkoutSessionCompleted.amount_total == STRIPE_PLAN_SIXMONTH,
          twelveMonth:
            checkoutSessionCompleted.amount_total == STRIPE_PLAN_TWELVEMONTH,
        },
        renewalDate: checkoutSessionCompleted.expires_at,
        cancelData: "",
        active: true,
      },
    };
  },

  customerPayPalModel(checkoutSessionCompleted) {
    return {
      provider: "paypal",
      paypalCustomId: checkoutSessionCompleted.id,
      subscription: {
        type: {
          oneMonth: checkoutSessionCompleted.plan_id === PAYPAL_PLAN_MONTHLY,
          sixMonth: checkoutSessionCompleted.plan_id === PAYPAL_PLAN_SIXMONTH,
          twelveMonth:
            checkoutSessionCompleted.plan_id === PAYPAL_PLAN_TWELVEMONTH,
        },
        startDate: checkoutSessionCompleted.update_time,
        endDate: checkoutSessionCompleted.billing_info.next_billing_time,
      },
    };
  },
  getUserData: async (id) => {
    try {
      return await strapi.query("plugin::users-permissions.user").findOne({
        where: { id: id },
      });
    } catch (err) {
      return err;
    }
  },

  getUserDataByStripeCustomerId: async (stripeCustomerId) => {
    try {
      return await strapi.query("plugin::users-permissions.user").findOne({
        where: { stripeCustomerId: stripeCustomerId },
      });
    } catch (err) {
      return err;
    }
  },
};
