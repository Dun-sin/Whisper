import React, { useRef, useState } from 'react';
import { decrypt, encrypt, generateCode } from 'src/lib/utils';
import PropTypes from 'prop-types';
import { api } from 'src/lib/axios';
import { useAuth } from 'src/context/AuthContext';

const Login = () => {
	const { dispatchAuth } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [toInputCode, setToInputCode] = useState(false);
	const [email, setEmail] = useState('');

	const emailRef = useRef();
	const codeRef = useRef();

	const handleEmailInput = async () => {
		const email = emailRef.current.value.trim();

		if (!email) {
			setError('Email not provided');
			return;
		}

		try {
			setIsLoading(true);
			const code = generateCode();
			const response = await api.post('/code', {
				email,
				code,
			});

			localStorage.setItem('code', encrypt(code));

			if (response.status === 200) {
				setToInputCode(true);
				setEmail(email);
			}
		} catch (error) {
			setError('Failed to send code. Please try again.');
			console.error(error);
		} finally {
			setIsLoading(false);
			emailRef.current.value = '';
		}
	};

	const handleCodeInput = async () => {
		const inputedCode = codeRef.current.value.trim();

		if (!inputedCode) {
			setError('No code provided');
			return;
		}

		try {
			setIsLoading(true);
			const storedCode = decrypt(localStorage.getItem('code'));

			if (inputedCode === storedCode) {
				const response = await api.post('/login', { email });

				if (response.status === 200) {
					const { id } = response.data;

					dispatchAuth({
						type: 'LOGIN',
						payload: {
							loginId: id,
							loginType: 'email',
							email,
						},
					});
				} else {
					setError(response.data.message || 'Login failed. Please try again.');
				}
			} else {
				setError('Wrong code. Please try again.');
			}
		} catch (error) {
			setError('Login failed. Please try again.');
			console.error(error);
		} finally {
			setIsLoading(false);
			codeRef.current.value = '';
		}
	};

	return (
		<section className="flex flex-col gap-3">
			{toInputCode ? (
				<InputMethod
					refProp={codeRef}
					isLoading={isLoading}
					handleSubmit={handleCodeInput}
					inputValue={{
						type: 'text',
						name: 'code',
						placeholder: 'Enter the code received',
					}}
				/>
			) : (
				<InputMethod
					refProp={emailRef}
					isLoading={isLoading}
					handleSubmit={handleEmailInput}
					inputValue={{
						type: 'email',
						name: 'email',
						placeholder: 'Enter your email',
					}}
				/>
			)}
			{error && <p className="text-red-500 text-center">{error}</p>}
		</section>
	);
};

export default Login;

const InputMethod = ({ refProp, isLoading, handleSubmit, inputValue }) => {
	return (
		<>
			{inputValue.name === 'code' && <p className="text-center">Check your email for the code</p>}
			<label htmlFor={inputValue.name} className="w-full flex items-center justify-center">
				<input
					type={inputValue.type}
					className="w-full max-w-[600px] min-w-[300px] p-3 rounded-md text-black border-highlight border"
					name={inputValue.name}
					ref={refProp}
					placeholder={inputValue.placeholder}
				/>
			</label>
			<button
				disabled={isLoading}
				onClick={handleSubmit}
				className={`bg-highlight w-[80%] max-w-[400px] min-w-[300px] py-2 rounded-md ${
					isLoading ? 'opacity-50 cursor-not-allowed' : ''
				}`}
			>
				{isLoading ? 'Loading...' : 'Submit'}
			</button>
		</>
	);
};

InputMethod.propTypes = {
	refProp: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
	]),
	isLoading: PropTypes.bool,
	handleSubmit: PropTypes.func,
	inputValue: PropTypes.shape({
		type: PropTypes.string,
		name: PropTypes.string,
		placeholder: PropTypes.string,
	}),
};
