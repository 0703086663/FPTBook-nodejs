const homeRouter = require("./home");
const adminRouter = require("./admin");
const cartRouter = require("./cart");
const userRouter = require("./user");

function route(app) {
  app.use((req, res, next) => {
    if (!req.session.cart) {
      req.session.cart = [];
    }
    next();
  });

  app.use((req, res, next) => {
    const cartItemCount = req.session.cart ? req.session.cart.length : 0;
    res.locals.cartItemCount = cartItemCount;
    next();
  });

  app.use("/user", userRouter);
  app.use("/cart", cartRouter);
  app.use("/admin", adminRouter);
  app.use("/", homeRouter);
}

module.exports = route;
