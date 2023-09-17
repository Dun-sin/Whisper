const UserRouter = require('express').Router();
const validator = require('validator').default;

const User = require('../models/UserSchema');

const loginUser = async (req, res) => {
	const { email } = req.body;

	if (typeof email !== 'string' || !validator.isEmail(email)) {
		res.status(406).json({
			message: 'Email is invalid',
		});

		return;
	}

	try {
		let findUser = await User.findOne({ email });

		if (!findUser) {
			const newUser = await User.create({ email });

			res.status(200).json({
				id: newUser._id,
			});

			return;
		}

		res.status(200).json({
			id: findUser._id,
		});
	} catch (err) {
		res.status(500).json({
			message: 'An error occured whiles logging in',
		});
	}
};

const addUser = (req, res) => {
	User.create(
		{
			email: req.body.email,
		},
		(err, data) => {
			if (err) {
				return err;
			}
			return res.status(202).json(data);
		},
	);
};

const findUser = (req, res) => {
	User.find(req.query, (err, data) => {
		if (err) {
			return err;
		} else {
			if (data.length === 0) {
				return res.sendStatus(202);
			} else {
				const user = {};

				user['id'] = data[0]._id.toString();
				return res.status(200).send(JSON.stringify(user));
			}
		}
	});
};

UserRouter.route('/login').post(loginUser);
UserRouter.route('/user').post(addUser).get(findUser);

module.exports = UserRouter;
