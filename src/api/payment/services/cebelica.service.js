var https = require("https");

const config = require("../config/cebelica.config");

module.exports = {
  init: async (name, subscriptionPrice) => {
    let cebelicaObj = { ...config.cebelicaObjMock };

    const date = module.exports.getCurrentDate();
    const subscriptionType = config.priceList[subscriptionPrice];

    cebelicaObj.assignPartner = await module.exports.assignPartner(name);
    cebelicaObj.invoiceCreate = await module.exports.invoiceCreate(
      encodeURI(subscriptionType),
      date,
      cebelicaObj.assignPartner ?? null
    );
    cebelicaObj.invoiceAdd = await module.exports.invoiceAdd(
      encodeURI(subscriptionType),
      subscriptionPrice,
      cebelicaObj.invoiceCreate ?? null
    );
    // cebelicaObj.invoicePayment = await module.exports.invoiceAdd(
    //   date,
    //   cebelicaObj.invoiceCreate ?? null
    // );

    console.log(cebelicaObj);

    return 200;
  },

  assignPartner: async (name) => {
    if (!name) {
      return null;
    }

    const url = `${config.urlList.assignPartner}&name=${encodeURI(name)}`;

    try {
      return await module.exports.ceebelicaApi(url);
    } catch (err) {
      console.log(err);

      return null;
    }
  },

  invoiceCreate: async (subscriptionType, date, partnerId) => {
    if (!partnerId) {
      return null;
    }

    const url = `${config.urlList.invoiceCreate}&date_sent=${date}&date_to_pay=${date}&date_served=${date}&id_partner=${partnerId}`;

    try {
      return await module.exports.ceebelicaApi(url);
    } catch (err) {
      console.log(err);

      return null;
    }
  },

  invoiceAdd: async (subscriptionType, price, invoiceId) => {
    if (!invoiceId) {
      return null;
    }

    const url = `${config.urlList.invoiceAdd}&title=${subscriptionType}&qty=1&price=${price}&vat=0&discount=0&id_invoice_sent=${invoiceId}`;

    try {
      return await module.exports.ceebelicaApi(url);
    } catch (err) {
      console.log(err);

      return null;
    }
  },

  invoicePayment: async (date, invoiceId) => {
    if (!invoiceId) {
      return null;
    }

    const url = `${config.urlList.invoicePayment}&date_of=${date}&amount=10&id_payment_method=1&id_invoice_sent=${invoiceId}`;

    try {
      return await module.exports.ceebelicaApi(url);
    } catch (err) {
      console.log(err);

      return null;
    }
  },

  ceebelicaApi: async (url, body = null) => {
    // Perform the request
    return new Promise((resolve, reject) => {
      const req = https.request(url, config.options, (res) => {
        let data = "";

        // A chunk of data has been received.
        res.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received.
        res.on("end", () => {
          const endData = JSON.parse(data);

          resolve(endData[0][0].id);
        });
      });

      // Handle errors
      req.on("error", (error) => {
        console.error(error);

        reject(error);
      });

      // End the request
      req.end();
    });
  },

  setUrlParams: (params) => {
    return Object.keys(params).reduce((total, key) => {
      return total + `&${key}=${encodeURI(params[key])}`;
    }, "");
  },

  getCurrentDate: () => {
    const currentDate = new Date();

    // Get the year, month, and day
    let year = currentDate.getFullYear();
    let month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 to month because it's zero-based
    let day = ("0" + currentDate.getDate()).slice(-2);

    // Format the date as YYYY-MM-DD
    return `${year}.${month}.${day}`;
  },
};
