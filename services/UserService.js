import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';


const getAllActiveUsers = async () => {
    try {
        const users = await db.User.findAll({
            where: { status: true },
            include: [{
                model: db.Session,
                attributes: ['id', 'token', 'expiration','createdAt'], // Incluye solo los campos necesarios
            }]
        });
        return { code: 200, message: users };
    } catch (error) {
        return { code: 500, message: 'Error retrieving users' };
    }
};

const findUsers = async (filters) => {
    try {

        const query = {};
        const loggedInBefore = filters.loggedInbefore;
        const loggedInAfter = filters.loggedInafter;

        if (filters.deleted !== undefined) {
            query.status = filters.deleted === 'false';
        }

        if (filters.name) {
            query.name = { [db.Sequelize.Op.like]: `%${filters.name}%` };
        }

        const users = await db.User.findAll({
            where: query,
            include: [{
                model: db.Session,
                attributes: ['expiration'],
                where: {
                    expiration:{
                        [db.Sequelize.Op.and]: [
                            ...(loggedInBefore ? [{ [db.Sequelize.Op.lt]: loggedInBefore }] : []),
                            ...(loggedInAfter ? [{ [db.Sequelize.Op.gt]: loggedInAfter }] : [])
                        ]
                    }
                },
                required: false,
                order: [['expiration', 'DESC']],
                //limit: 1
            }]
        });

        const usersWithSessions = users.filter(user => user.Sessions.length > 0);

        return {
            code: 200, 
            message: usersWithSessions
        };
        
        
    } catch (error) {
        return { code: 500, message: 'Error retrieving users' };
    }
};



const bulkCreateUsers = async (users) => {
    try {
        const createdUsers = [];
        const failedUsers = [];

        for (const userData of users) {
            try {
                const { name, email, password, cellphone } = userData;

                // Validar que el email no exista ya en la base de datos
                const existingUser = await db.User.findOne({ where: { email } });
                if (existingUser) {
                    throw new Error('User already exists');
                }

                const encryptedPassword = await bcrypt.hash(password, 10);
                const newUser = await db.User.create({
                    name,
                    email,
                    password: encryptedPassword,
                    cellphone,
                    status: true
                });
                createdUsers.push(newUser);
            } catch (error) {
                failedUsers.push(userData);
            }
        }

        return {
            code: 200,
            message: {
                successCount: createdUsers.length,
                failureCount: failedUsers.length,
                failedUsers
            }
        };
    } catch (error) {
        return { code: 500, message: 'Error creating users' };
    }
};


const createUser = async (req) => {
    const {
        name,
        email,
        password,
        password_second,
        cellphone} = req.body;
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Passwords do not match'};}

    const user = await db.User.findOne({
        where: {
            email: email}});
    if (user) {
        return {
            code: 400,
            message: 'User already exists'};
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true});

    return {
        code: 200,
        message: 'User created successfully with ID: ' + newUser.id,}};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,}})};}

const updateUser = async (req) => {
    const user = db.User.findOne({
        where: {
            id: req.params.id,
            status: true,}});
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id}});
    return {
        code: 200,
        message: 'User updated successfully'};}

const deleteUser = async (id) => {
    /* await db.User.destroy({
        where: {
            id: id
        }
    }); */
    const user = db.User.findOne({
        where: {
            id: id,
            status: true,}});
    await  db.User.update({
        status: false}, {
        where: {
            id: id}});
    return {
        code: 200,
        message: 'User deleted successfully'};}

export default {
    getAllActiveUsers,
    findUsers,
    bulkCreateUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser
}