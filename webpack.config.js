const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const CLIENT = "./src/public/js/";

module.exports = {
  entry: CLIENT + "app.js",
  output: {
    filename: "js/main.js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  plugins: [new MiniCssExtractPlugin({ filename: "css/app.css" })],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
};
