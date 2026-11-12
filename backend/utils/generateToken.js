// import jwt from 'jsonwebtoken';

// const generateToken = (userId) => {
//   const secret = process.env.JWT_SECRET;
//   if (!secret) {
//     throw new Error('JWT_SECRET environment variable is not set');
//   }
//   return jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
// };

// export default generateToken;

import jwt from 'jsonwebtoken';

const generateToken = (userId, email, role = 'user') => {
    // Ensure the environment variable JWT_SECRET is defined
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        console.error('Error: JWT_SECRET environment variable is not set');
        throw new Error('JWT_SECRET environment variable is not set');
    }

    // Generate the JWT token with id, email, and role
    return jwt.sign(
        { id: userId, email: email, role: role || 'user' },
        secret,
        { expiresIn: '24h' }
    );
};

export default generateToken;

