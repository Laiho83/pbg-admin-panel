const fs = require("fs");
const outputYearly = fs
  .readFileSync(
    "src/api/payment/controllers/bank-payment/bank-payment-100.html"
  )
  .toString();

const outputMonthly = fs
  .readFileSync("src/api/payment/controllers/bank-payment/bank-payment-55.html")
  .toString();

module.exports = {
  PaymentEmailTemplate(type) {
    let selectedSubscription;

    if (subscription == 50) {
      selectedSubscription = outputMonthly;
    } else if (subscription == 100) {
      selectedSubscription = outputYearly;
    } else {
      return;
    }

    return {
      subject: "PrettyBarnGood ORDER RECEIVED _ Bank transfer INFO",
      text: `ORDER RECEIVED _ Bank transfer INFO`,
      html: selectedSubscription,
    };
  },
};
