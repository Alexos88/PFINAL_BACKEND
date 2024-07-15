import { Router } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';


const router = Router();

router.get('/getAllUsers',[AuthMiddleware.validateToken], async (req, res) => {
    const response = await UserService.getAllActiveUsers();
    res.status(response.code).json(response.message);
});

router.get('/findUsers',[AuthMiddleware.validateToken], async (req, res) => {
    try {
        const response = await UserService.findUsers(req.query);
        res.status(response.code).json(response.message);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
});

router.post('/bulkCreate',[AuthMiddleware.validateToken], async (req, res) => {
    const users = req.body;
    const response = await UserService.bulkCreateUsers(users);
    res.status(response.code).json(response.message);
});


router.post('/create', async (req, res) => {
    const response = await UserService.createUser(req);
    res.status(response.code).json(response.message);
});

router.get('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const response = await UserService.getUserById(req.params.id);
        res.status(response.code).json(response.message);
    });

router.put('/:id', [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async(req, res) => {
        const response = await UserService.updateUser(req);
        res.status(response.code).json(response.message);
    });

router.delete('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async (req, res) => {
       const response = await UserService.deleteUser(req.params.id);
       res.status(response.code).json(response.message);
    });

export default router;