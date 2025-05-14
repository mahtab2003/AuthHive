import { verifyJwtToken } from '../utils/jwt.js';

export const jwtAuth = {
    async authenticate(request, h) {
        const authorization = request.headers.authorization;
        if (!authorization) {
            return h.response({ error: 'Authorization token missing' }).code(401);
        }

        const token = authorization.split(' ')[1]; // Extract token from "Bearer <token>"

        // Verify the token
        const decoded = verifyJwtToken(token);

        if (!decoded) {
            return h.response({ error: 'Invalid or expired token' }).code(401);
        }

        // Attach the decoded user data to the request object
        request.user = decoded; 

        return h.continue; // Allow the request to continue
    }
};

export default jwtAuth;