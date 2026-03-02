module.exports = {
  devServer: {
    port: 8080,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3000', ws: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
};
