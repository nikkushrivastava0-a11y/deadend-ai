import { app } from '../server.js';

// One function handles every API route, preserving the original Node request API.
export default function handler(request, response) {
  app.emit('request', request, response);
}
