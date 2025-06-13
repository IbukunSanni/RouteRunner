import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5088', // adjust as needed
  headers: {
    'Content-Type': 'application/json',
  },
});
