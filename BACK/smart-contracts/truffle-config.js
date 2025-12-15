module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // OJO: Revisa que coincida con tu Ganache (arriba dice RPC Server)
      network_id: "*",       // Cualquier red (default: none)
    },
  },

  // Configura la versión del compilador igual que tu contrato
  compilers: {
    solc: {
      version: "0.8.0",      // O la versión que pusiste en tu pragma
    }
  }
};