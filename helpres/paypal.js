const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id:
    "AbLeOz5n2vDP-6VKg0TUdF2MOF80ojJ0t7xpLlV2gkLuzYyjpS2RdNyXk3n8TteEaLNQESgn94q_i4Pt",
  client_secret:
    "EGeT9HrXb5rmQsM_sNw7b9G322ZkM5yncHUQyV8JlAM9FxNTa3IOpmwoFOxtjxpwUv0Tk3PzPmc004_c",
});

module.exports = paypal;
