/* eslint-disable require-atomic-updates */
import React, { useRef, useState } from 'react';

import { api } from 'src/lib/axios';

import { useAuth } from 'src/context/AuthContext';

const SignupAnonUser = () => {
	const { authState, dispatchAuth } = useAuth();
	const { loginId } = authState;
	const emailRef = useRef();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSignup = async () => {
		setError('');
		setLoading(true);
		let email = emailRef.current.value;
		if (email === '') {
			setError('Email is empty');
			setLoading(false);
			return;
		}

		email = email.trim();

		try {
			const response = await api.post('/login', {
				email,
				id: loginId,
			});

			const data = await response.data;
			if (response.status === 200) {
				const id = data.id;

				dispatchAuth({
					type: 'LOGIN',
					payload: {
						loginId: id,
						loginType: 'email',
						email,
					},
				});

				emailRef.current.value = '';
			} else if (response.status === 500) {
				throw new Error(data.message);
			}
			setLoading(false);
		} catch (err) {
			const errCode = err.response.status;
			if (errCode === 409) {
				setError(
					'Email already exists, try loggin out and loggin in with the right email or using another email'
				);
			} else if (errCode === 500) {
				setError(`Oops, couldn't create your account, our fault.`);
			}
			setLoading(false);
		}
	};
	return (
		<>
			<h1 className="text-2xl font-bold">Please Create an Account</h1>
			<div className="w-full">
				<label htmlFor="email" className="w-full flex items-center justify-center">
					<input
						type="email"
						className="w-[80%] max-w-[400px] min-w-[300px] p-3 rounded-md text-black"
						name="email"
						ref={emailRef}
						placeholder="Enter Your Email"
					/>
				</label>
			</div>
			<p className="text-center text-red w-[80%] max-w-[400px] min-w-[300px]">
				{error !== '' && error}
			</p>
			{loading ? (
				<p>Creating your account</p>
			) : (
				<button
					onClick={handleSignup}
					className="bg-highlight w-[80%] max-w-[400px] min-w-[300px] py-2 rounded-md"
				>
					Create Account
				</button>
			)}
		</>
	);
};

export default SignupAnonUser;
