const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

async function connect() {
  mongoose.connect(
    "mongodb+srv://admin:admin@cluster0.iqhmh1w.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  mongoose.connection
    .once("open", () => console.log("Database has been connected !!!"))
    .on("error", (error) => {
      console.log("Can not connect to Database !!!", error);
    });
}

module.exports = { connect };
