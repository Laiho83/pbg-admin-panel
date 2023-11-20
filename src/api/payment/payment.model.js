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
    invoice: checkoutSessionCompleted.invoice,
    type: parseInt((checkoutSessionCompleted.amount_total / 10000) * 12),
    startDate: new Date(),
    renewalDate: new Date(checkoutSessionCompleted.expires_at * 1000),
    cancelData: "",
    status: "active",
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
