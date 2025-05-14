import Hapi from '@hapi/hapi';
import auth from './routes/auth.js';
import { verifyJwtToken } from './utils/jwt.js';

async function startServer() {
    try {
        const server = Hapi.server({
            port: process.env.PORT || 4000,
            host: process.env.HOST || 'localhost',
            routes: {
                cors: {
                    origin: ['*'], // or ['*'] for all origins (not recommended for prod)
                    credentials: true, // Allow cookies and authentication headers
                    headers: ['Accept', 'Content-Type', 'Authorization'], // Allow custom headers
                    additionalHeaders: ['cache-control', 'x-requested-with', 'Access-Control-Allow-Origin'], // Allow these headers
                }
            }
        });
        server.ext('onPreResponse', (request, h) => {
            const response = request.response.isBoom ? request.response.output : request.response;

            response.headers['Access-Control-Allow-Origin'] = '*';
            response.headers['Access-Control-Allow-Headers'] = 'Accept, Content-Type, Authorization';
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            response.headers['Access-Control-Allow-Credentials'] = 'true';

            return h.continue;
        });

        // Register your JWT strategy
        server.auth.scheme('verifyJwt', () => {
            return {
                authenticate: async (request, h) => {
                    const authHeader = request.headers.authorization;

                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return h.response({ message: 'Missing or invalid Authorization header' });
                    }

                    const token = authHeader.split(' ')[1];
                    const decoded = verifyJwtToken(token);

                    console.log('Decoded JWT:', decoded); // Debugging line

                    if (!decoded) {
                        return h.response('Invalid or expired token');
                    }

                    if (decoded.role !== 'user') {
                        return h.response('Unauthorized access').code(403);
                    }

                    return h.authenticated({ credentials: decoded });
                }
            };
        });

        // Register your JWT strategy
        server.auth.scheme('verifyAdminJwt', () => {
            return {
                authenticate: async (request, h) => {
                    const authHeader = request.headers.authorization;

                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return h.response({ message: 'Missing or invalid Authorization header' });
                    }

                    const token = authHeader.split(' ')[1];
                    const decoded = verifyJwtToken(token);

                    console.log('Decoded JWT:', decoded); // Debugging line

                    if (!decoded) {
                        return h.response('Invalid or expired token');
                    }

                    if (decoded.role !== 'admin') {
                        return h.response('Unauthorized access').code(403);
                    }

                    return h.authenticated({ credentials: decoded });
                }
            };
        });

        server.auth.strategy('jwtAuth', 'verifyJwt');
        server.auth.strategy('adminAuth', 'verifyAdminJwt');

        // Register routes
        server.route({
            method: 'OPTIONS',
            path: '/{any*}',
            handler: (request, h) => {
                return h.response('CORS preflight OK').code(200);
            },
            options: {
                cors: {
                    origin: ['*'],
                    credentials: true
                }
            }
        })
        server.route(auth);

        await server.start();
        console.log(`Server running at: ${server.info.uri}`);
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
}

startServer();