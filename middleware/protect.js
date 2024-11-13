const jwt = require('jsonwebtoken');

// JWT doğrulama middleware'i
const protect = (req, res, next) => {
  let token;
  
  // Token'ı header'dan alıyoruz
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // "Bearer <token>"
      
      // Token'ı doğruluyoruz
      const decoded = jwt.verify(token, 'secretKey');
      
      // Kullanıcıyı request'e ekliyoruz
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Token bulunamadı, giriş yapmanız gerekiyor' });
  }
};

module.exports = protect;
