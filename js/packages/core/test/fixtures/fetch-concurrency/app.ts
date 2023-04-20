const express = require('express');
const app = express();
 import * as utils from '@applitools/utils'
 import * as path from 'path'
 import {promisify} from 'util';

export function createApp({maxRequests}: {maxRequests: number}){

// Initialize a counter for the number of active requests
let activeRequests: number = 0;

// Middleware function to limit the number of parallel requests
const limitParallelRequests = async (_req: any, res: any, next: any) => {
    // If the maximum number of requests is exceeded, send a 503 error
    if (activeRequests >= maxRequests) {
        return res.status(503).send('Too many requests');
    }

    // Increment the counter for active requests
    activeRequests++;

    // Call the next middleware function
    next();

    // Decrement the counter for active requests when the response is sent
    res.on('finish', () => {
    activeRequests--;
    });
    };

    const startApp = () => {
        // Use the middleware function for all routes
        app.use(limitParallelRequests);
        app.get('/image1', (_req: any, res: any) => {
            res.sendFile(path.join(__dirname, '/smurfs.jpg'));
        });
        app.get('/image2', (_req: any, res: any) => {
          res.sendFile(path.join(__dirname, '/smurfs.jpg'));
        });
        app.get('/image3', (_req: any, res: any) => {
          res.sendFile(path.join(__dirname, '/smurfs.jpg'));
        });
        app.get('/image4', (_req: any, res: any) => {
          res.sendFile(path.join(__dirname, '/smurfs.jpg'));
        });
        app.get('/gargamel1', (_req: any, res: any) => {
          res.sendFile(path.join(__dirname, '/gargamel.jpg'));
        });
        app.get('/gargamel2', (_req: any, res: any) => {
          res.sendFile(path.join(__dirname, '/gargamel.jpg'));
        });
        app.get('/gargamel3', (_req: any, res: any) => {
          res.sendFile(path.join(__dirname, '/gargamel.jpg'));
        });
        app.get('/gargamel4', (_req: any, res: any) => {
          res.sendFile(path.join(__dirname, '/gargamel.jpg'));
        });
        
        // Start the server
        const server = app.listen(3000, () => {
            console.log('Server listening on port 3000');
          });
       
        return promisify(server.close.bind(server));
    }

    return {startApp}
}