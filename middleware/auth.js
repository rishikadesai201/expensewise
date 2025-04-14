const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {const jwt = require('jsonwebtoken');

    const authenticate = async (req, res, next) => {
      try {
        // Get token from either cookie, Authorization header, or query param (for websockets)
        const token = req.cookies?.token || 
                     req.headers.authorization?.split(' ')[1] || 
                     req.query.token;
        
        if (!token) {
          return res.status(401).json({ 
            success: false,
            code: 'NO_TOKEN',
            message: 'Authentication required' 
          });
        }
    
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Token refresh logic (only if token is valid but expiring soon)
        const now = Math.floor(Date.now() / 1000);
        const expiresSoon = decoded.exp - now < 900; // 15 minutes
        
        if (expiresSoon) {
          const newToken = jwt.sign(
            { 
              userId: decoded.userId, 
              email: decoded.email,
              refreshCount: (decoded.refreshCount || 0) + 1
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );
          
          // Set new cookie
          res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
            sameSite: 'strict',
            path: '/'
          });
          
          // Also send in response header
          res.setHeader('X-Refreshed-Token', newToken);
        }
        
        // Attach user to request
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          tokenExpiresAt: decoded.exp * 1000 // Convert to milliseconds
        };
        
        // Add token info to response locals
        res.locals.tokenInfo = {
          expiresSoon,
          expiresAt: decoded.exp * 1000
        };
        
        next();
      } catch (error) {
        console.error('Authentication error:', error);
        
        // Clear invalid token cookie
        res.clearCookie('token');
        
        const response = {
          success: false,
          code: 'AUTH_ERROR'
        };
        
        if (error.name === 'TokenExpiredError') {
          response.message = 'Session expired. Please log in again.';
          response.code = 'TOKEN_EXPIRED';
          return res.status(401).json(response);
        }
        
        if (error.name === 'JsonWebTokenError') {
          response.message = 'Invalid token. Please log in again.';
          response.code = 'INVALID_TOKEN';
          return res.status(401).json(response);
        }
        
        response.message = 'Authentication failed. Please try again.';
        res.status(500).json(response);
      }
    };
    
    // Higher-order function for role-based access
    authenticate.withRole = (role) => {
      return async (req, res, next) => {
        await authenticate(req, res, () => {
          // Add your role checking logic here
          // Example: if (req.user.role !== role) return res.status(403).json(...)
          next();
        });
      };
    };
    
    module.exports = authenticate;
    // Get token from either cookie, Authorization header, or query param (for websockets)
    const token = req.cookies?.token || 
                 req.headers.authorization?.split(' ')[1] || 
                 req.query.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        code: 'NO_TOKEN',
        message: 'Authentication required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Token refresh logic (only if token is valid but expiring soon)
    const now = Math.floor(Date.now() / 1000);
    const expiresSoon = decoded.exp - now < 900; // 15 minutes
    
    if (expiresSoon) {
      const newToken = jwt.sign(
        { 
          userId: decoded.userId, 
          email: decoded.email,
          refreshCount: (decoded.refreshCount || 0) + 1
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      // Set new cookie
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour
        sameSite: 'strict',
        path: '/'
      });
      
      // Also send in response header
      res.setHeader('X-Refreshed-Token', newToken);
    }
    
    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      tokenExpiresAt: decoded.exp * 1000 // Convert to milliseconds
    };
    
    // Add token info to response locals
    res.locals.tokenInfo = {
      expiresSoon,
      expiresAt: decoded.exp * 1000
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Clear invalid token cookie
    res.clearCookie('token');
    
    const response = {
      success: false,
      code: 'AUTH_ERROR'
    };
    
    if (error.name === 'TokenExpiredError') {
      response.message = 'Session expired. Please log in again.';
      response.code = 'TOKEN_EXPIRED';
      return res.status(401).json(response);
    }
    
    if (error.name === 'JsonWebTokenError') {
      response.message = 'Invalid token. Please log in again.';
      response.code = 'INVALID_TOKEN';
      return res.status(401).json(response);
    }
    
    response.message = 'Authentication failed. Please try again.';
    res.status(500).json(response);
  }
};

// Higher-order function for role-based access
authenticate.withRole = (role) => {
  return async (req, res, next) => {
    await authenticate(req, res, () => {
      // Add your role checking logic here
      // Example: if (req.user.role !== role) return res.status(403).json(...)
      next();
    });
  };
};

module.exports = authenticate;