module.exports = {
  transpileDependencies: ["vuetify"],
  pages: {
    index: {
      entry: "src/main.js",
      title: "Virma Kartta"
    }
  },
  configureWebpack: {
    devtool: "source-map"
  },
  publicPath: './'
};
