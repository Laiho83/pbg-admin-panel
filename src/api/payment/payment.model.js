const payPalPaymentModel = {
  provider: "paypal",
  paypalCustomId: checkoutSessionCompleted.id,
  subscription: {
    type: {
      oneMonth: checkoutSessionCompleted.plan_id === PAYPAL_PLAN_MONTHLY,
      sixMonth: checkoutSessionCompleted.plan_id === PAYPAL_PLAN_SIXMONTH,
      twelveMonth: checkoutSessionCompleted.plan_id === PAYPAL_PLAN_TWELVEMONTH,
    },
    startDate: checkoutSessionCompleted.update_time,
    endDate: checkoutSessionCompleted.billing_info.next_billing_time,
  },
};

const stripePaymentModel = {
  provider: "stripe",
  stripeCustomerId: checkoutSessionCompleted.customer,
  stripeEmail: checkoutSessionCompleted.customer_details.email,
  subscription: {
    id: checkoutSessionCompleted.subscription,
    type: {
      oneMonth: checkoutSessionCompleted.amount_total == STRIPE_PLAN_MONTHLY,
      sixMonth: checkoutSessionCompleted.amount_total == STRIPE_PLAN_SIXMONTH,
      twelveMonth:
        checkoutSessionCompleted.amount_total == STRIPE_PLAN_TWELVEMONTH,
    },
    startDate: new Date(),
    renewalDate: checkoutSessionCompleted.expires_at,
    cancelData: "",
    active: true,
  },
};

const stripeExample = {
  provider: "stripe",
  stripeCustomerId: "cus_OnMbkPie7eMWaK",
  stripeEmail: "pbgww.dev@gmail.com",
  subscription: {
    id: "sub_1NzlrxIxfGnvhPHyxtcEKxAZ",
    type: {
      oneMonth: false,
      sixMonth: true,
      twelveMonth: false,
    },
    renewalDate: 1697053517,
    cancelData: "",
    active: true,
  },
};
