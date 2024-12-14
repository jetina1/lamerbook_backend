import express from 'express';
import { body } from 'express-validator';
import * as AuthController from '../controllers/auth.controller.js'; // Ensure you have .js extension
import multer from 'multer';
const upload = multer({ dest: 'uploads/profile' });

const router = express.Router();

// Signup route
router.post(
  '/signup',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  AuthController.signup
);
// Admin Signup route
router.post(
  '/admin/signup',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  AuthController.adminSignup
);
// Signin route
router.post(
  '/signin',
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  AuthController.signin
);
router.post('/logout', AuthController.authenticateToken, AuthController.logout); 
router.get('/user', AuthController.getUserData);
router.put('/user/edit',AuthController.updateUser);
router.put('/users/profile/image', upload.single('profileImage'),AuthController. updateProfileImage);
router.get('/profile/:image', (req, res) => {
    const { image } = req.params;
    const profilePath = path.join('./uploads/profile/', image); // Adjust the path as per your directory structure

    // Check if the file exists
    fs.access(profilePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: 'Thumbnail file not found.' });
        }

        res.sendFile(path.resolve(profilePath));
    });
});
export default router; 



// Dashboard data route
// app.get('/api/admin/dashboard', (req, res) => {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     try {
//         const decoded = jwt.verify(token, SECRET_KEY);
//         res.json({ user: decoded });
//     } catch (err) {
//         res.status(401).json({ message: 'Invalid token' });
//     }
// });