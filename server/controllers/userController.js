const UserRouter = require('express').Router();
const validator = require('validator').default;

const User = require('../models/UserSchema');

const { OK, NOT_FOUND, NOT_ACCEPTABLE, INTERNAL_SERVER_ERROR } = require('../../constants.json');

// Defining separate email validation middleware
const emailValidator = (req, res, next) => {
        const { email } = req.body;

        if (typeof email !== 'string' || !validator.isEmail(email)) {
                return res.status(NOT_ACCEPTABLE).json({
                        message: 'Email is invalid',
                });
        } else {
                next();
        }
};

const loginUser = async (req, res) => {
        const { email } = req.body;

        try {
                let findUser = await User.findOne({ email });

                if (!findUser) {
                        const newUser = await User.create({ email });

                        res.status(OK).json({
                                id: newUser._id,
                        });

                        return;
                }

                res.status(OK).json({
                        id: findUser._id,
                });
        } catch (err) {
                res.status(INTERNAL_SERVER_ERROR).json({
                        message: 'An error occured while logging in',
                });
        }
};

const getProfile = async (req, res) => {
        try {
                const { email } = req.params;

                // Find the user by email
                const user = await User.findOne({ email });

                if (!user) {
                        return res.status(NOT_FOUND).json({ error: 'User not found' });
                }

                // Send the user profile data as JSON response
                res.status(OK).json(user);
        } catch (error) {
                console.error('Error fetching user profile:', error);
                res.status(INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        }
};

const updateProfile = async (req, res) => {
        const { username, aboutMe, gender, age, email, settings } = req.body;

        try {
                // Find the user by email
                const user = await User.findOne({ email });

                if (!user) {
                        return res.status(NOT_FOUND).json({ error: 'User not found' });
                }

                // Update user's profile with provided fields or the User fields or defaults
                user.username = username || user.username || 'Anonymous';
                user.aboutMe = aboutMe || user.aboutMe || null;
                user.gender = gender || user.gender || 'Unknown';
                user.age = age || user.age || null;
                user.settings = settings || user.settings;

                // Save the updated user profile
                await user.save();

                return res.status(OK).json({ message: 'Profile updated successfully' });
        } catch (error) {
                console.error(error);
                return res.status(INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        }
};

const deleteUser = async (req, res) => {
        const { email } = req.body;

        try {
                // Find the user by email
                const user = await User.findOne({ email });

                if (!user) {
                        return res.status(NOT_FOUND).json({ error: 'User not found' });
                }

                // Delete the user
                await user.deleteOne();

                return res.status(OK).json({ message: 'User deleted successfully' });
        } catch (error) {
                console.error(error);
                return res.status(INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        }
};

UserRouter.route('/login').post(emailValidator, loginUser);
UserRouter.route('/profile').post(emailValidator, updateProfile);
UserRouter.route('/profile/:email').get(getProfile);
UserRouter.route('/deleteUser').delete(emailValidator, deleteUser);   //Email validation applied to the required request handlers

module.exports = UserRouter;


