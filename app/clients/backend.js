const backend = {
  axios: {
    baseURL: `http://${process.env.HOSTNAME || "localhost"}:${process.env.PORT || "3000"}`,
    responseType: 'json'
  },
  options: {} // You can setup your interceptors here..
};

export default backend;
