const express = require('express');
const multer = require('multer');
const path = require('path');
const config = require('../../config');
const authController = require('./auth.controller');
const authValidation = require('./auth.validation');
const authMiddleware = require('../../common/middlewares/auth.middleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.post('/login', authValidation.loginValidation, authValidation.validate, authController.login);
router.post('/register', authValidation.registerValidation, authValidation.validate, authController.register);

router.use(authMiddleware);

router.get('/me', authController.me);
router.put('/profile', authValidation.profileValidation, authValidation.validate, authController.updateProfile);
router.post('/avatar', upload.single('avatar'), authController.uploadAvatar);
router.post('/logout', authController.logout);

module.exports = router;
