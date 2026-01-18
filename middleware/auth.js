const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {   
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ error: 'Invalid and expired token'});
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required '})
    }

    if (!req.user.role || !req.user.role.includes('admin')) {
        return res.status(401).json({ error: 'Admin access required'})
    }

    next();
}

module.exports = { authenticateToken, requireAdmin };