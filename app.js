// app.js
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // User modelini dahil et
const protect = require('./middleware/protect');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 8000;
const dotenv = require('dotenv');
dotenv.config();

// MongoDB'ye bağlanmak için bağlantı URL'sini kullanın
const mongoURI = 'mongodb://localhost:27017/trakrdatabase'; // Burada 'mydatabase' yerine kendi veritabanı adınızı kullanın

// MongoDB bağlantısını kur
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB\'ye başarıyla bağlanıldı!');
  })
  .catch(err => {
    console.error('MongoDB bağlantısı sırasında hata:', err);
  });

// JSON verisini alabilmek için middleware ekliyoruz
app.use(express.json());

  // Ana sayfa
app.get('/', (req, res) => {
  res.send('Merhaba, Express ve MongoDB!');
});

// Kayıt olma endpoint'i
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    // E-posta kontrolü
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta zaten kullanılıyor' });
    }
  
    // Yeni kullanıcı oluşturma
    const user = new User({
      name,
      email,
      password,
    });
  
    try {
      await user.save();
      res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi' });
    } catch (error) {
      res.status(500).json({ message: 'Kullanıcı kaydedilirken bir hata oluştu' });
    }
  });

// Korumalı profil endpoint'i
app.get('/profile', protect, (req, res) => {
    res.json({ message: `Hoş geldiniz ${req.user.id}` });
  });

// Giriş yapma endpoint'i
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Kullanıcıyı bulma
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
    }
  
    // Şifreyi doğrulama
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
    }
  
    // JWT oluşturma
  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
  
    res.json({
      message: 'Giriş başarılı',
      token, // JWT token'ı döndürüyoruz
    });
  });

// Sunucuyu başlatma
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
