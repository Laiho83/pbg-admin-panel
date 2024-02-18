const auth = "Basic ";

module.exports = Object.freeze({
  api_key: "719cf69w8m2vxssuhejp60araezt4ieqsdtg5rrg",
  options: {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  },
  urlList: {
    assignPartner: "https://www.cebelca.biz/API?_r=partner&_m=assure",
    invoiceCreate: "https://www.cebelca.biz/API?_r=invoice-sent&_m=insert-into",
    invoiceAdd: "https://www.cebelca.biz/API?_r=invoice-sent-b&_m=insert-into",
    invoicePayment:
      "https://www.cebelca.biz/API?_r=invoice-sent-p&_m=insert-into",
    generatePdf:
      "https://www.cebelca.biz/API-pdf?id=:invoice_id&res=invoice-sent",
  },
  priceList: {
    10: "Monthly Subscription",
    55: "Half year Subscription",
    100: "Yearly Subscription",
  },
  cebelicaObjMock: {
    assignPartner: null,
    invoiceCreate: null,
    invoiceAdd: null,
    invoicePayment: null,
  },
});
