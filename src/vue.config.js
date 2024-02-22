module.exports = {
    devServer: {
      proxy: {
        '/Users': {
          target: 'https://localhost:7296',
          changeOrigin: true,
          pathRewrite: { '^/Users': '' },
        },
      },
    },
  };
  

  