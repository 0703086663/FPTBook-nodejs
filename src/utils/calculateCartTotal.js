module.exports = {
  calculateCartTotal: async function (cartItems) {
    let total = 0;

    for (const item of cartItems) {
      total += item.price;
    }

    return Promise.resolve(total);
  },
};
