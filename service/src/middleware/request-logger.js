const { logger } = require('../utils/logger');

const requestLogger = (req, res, next) => {
    // Generate unique request ID
    req.id = Math.random().toString(36).substring(7);

    // Log request
    logger.info('Incoming Request', {
        id: req.id,
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        headers: {
            ...req.headers,
            authorization: req.headers.authorization ? '[REDACTED]' : undefined
        },
        ip: req.ip
    });

    // Get original send function
    const originalSend = res.send;

    // Override send
    res.send = function (body) {
        // Log response
        logger.info('Outgoing Response', {
            id: req.id,
            statusCode: res.statusCode,
            body: body,
            responseTime: Date.now() - req._startTime,
            headers: res.getHeaders()
        });

        // Call original send
        return originalSend.call(this, body);
    };

    // Store request start time
    req._startTime = Date.now();
    
    next();
};

module.exports = { requestLogger }; 