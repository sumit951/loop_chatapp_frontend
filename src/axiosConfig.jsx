// First we need to import axios.js
import axios from 'axios';
import { set, get, del, clear, keys } from 'idb-keyval';
// Next we make an 'instance' of it
//export const BASE_URL = 'http://localhost:3000';
export const BASE_URL = 'https://loop-chatapp.onrender.com';
export const FILE_PATH = 'https://apacvault.com/uploads/chat';
const instance = axios.create({
// .. where we make our configurations
    baseURL: BASE_URL
});

// Where you would set stuff like your 'Authorization' header, etc ...
//const token = localStorage.getItem('chat-token-info')
instance.interceptors.request.use(
  async (config) => {
    const token = await get('token'); // Async get from IndexedDB
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Also add/ configure interceptors && all the other cool stuff

//instance.interceptors.request...

export default instance;