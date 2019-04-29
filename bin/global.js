var axios = require('axios');


var axiosApi = axios.create({
  baseURL: 'http://localhost:8000/api/',
})

module.exports = {
  axiosApi,
}