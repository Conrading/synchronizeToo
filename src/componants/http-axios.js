import axios from 'axios'

export default axios.create({
    baseURL: "http://localhost:5011",
    //baseURL: "http://3.65.123.123:5011",
    headers: {"Content-type": "application/json",}
});