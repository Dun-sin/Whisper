import { useEffect, useRef, useState } from 'react';

import UserAvatar from '../components/UserAvatar';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import * as nsfwjs from 'nsfwjs';

import { useAuth } from 'context/AuthContext';

import { api } from 'src/lib/axios';
import { createClassesFromArray } from 'src/lib/utils';
import SignupAnonUser from './SignupAnonUser';

const Profile = () => {
	const [username, setUsername] = useState('Anonymous');
	const [profileResponse, setProfileResponse] = useState();
	const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
	const [imageFile, setImageFile] = useState(null);
	const [isImageSafe,setImageSafe] = useState(false);
	const { authState, dispatchAuth } = useAuth();
	const { logout } = useKindeAuth();
	
	const aboutRef = useRef(null);
	const genderRef = useRef(null);
	const ageRef = useRef(null);
	const imageRef = useRef(new Image());

	const { email } = authState;

	const getProfileData = async (email) => {
		try {
			const response = await api.get(`/profile/${email}`);
			const { aboutMe, age, gender, username, profileImage } = response.data;

			setUsername(username);
			if (profileImage) {
				setUploadedImageUrl(profileImage);
			}
			aboutRef.current.value = aboutMe || '';
			ageRef.current.value = age;
			genderRef.current.value = gender;
		} catch (error) {
			console.error('Error fetching user profile:', error);
		}
	};

	const handleUserName = (e) => setUsername(e.target.value);
	const handlerisImageSafe =async(imageSrc)=>{
			try {
				
				imageRef.current.src = imageSrc;
				const model = await nsfwjs.load();
				const predictions = await model.classify(imageRef.current);
				const neutralProb = predictions.find((p) => p.className === 'Neutral');
				return neutralProb.probability>=0.6;
			} catch (error) {
				setProfileResponse("Profile image update is temporarily unavailable. Please try again later.")
				console.error('Error classifying image:', error);
				return false;
			}
	};
	const handleImageUpload = () => {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.onchange = (e) => {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = async (event) => {
					const imageSafe = await handlerisImageSafe(event.target.result)
					imageSafe?setProfileResponse()
						:setProfileResponse('Profile image is not safe. Please upload a different image.');

					setImageSafe(imageSafe)
					setUploadedImageUrl(event.target.result);
					setImageFile(file);
				};
				reader.readAsDataURL(file);
			}
		};
		fileInput.click();
	};
	const handleEditProfile = () => {
		handleImageUpload();
	};
	const handleUpdateProfile = async () => {
		const formData = new FormData();
		formData.append('email', email);
		formData.append('username', username);
		formData.append('aboutMe', aboutRef.current.value);
		formData.append('gender', genderRef.current.value);
		formData.append('age', Number(ageRef.current.value));

		if(imageFile && isImageSafe){
			formData.append('profileImage',imageFile)
		}
		try {
			const response = await api.post('/profile', formData);
			console.log(response.data.message);
			setProfileResponse(response.data.message);

		} catch (error) {
			// Handle network errors or other unexpected issues
			console.error('Error uploading file:', error);
			if (error.response) {
				// Handle HTTP errors with custom messages
				console.log(error.response.data.error);
				setProfileResponse(error.response.data.error);
			}
		}

	};

	function logOut() {
		dispatchAuth({
			type: 'LOGOUT',
		});
		logout();
	}

	const handleDeleteAccount = async () => {
		try {
			const response = await api.delete('/deleteUser', {
				data: { email },
			});

			console.log(response.data.message);
			logOut();
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (email === null || email === '') {
			return
		}
		getProfileData(email);
	}, []);

	return (
		<div
			className={createClassesFromArray(
				'bg-light',
				'dark:bg-primary',
				'md:min-w-[calc(100%-120px)]',
				'flex items-center',
				'justify-center',
				'flex-col',
				'md:min-h-screen',
				'min-h-[calc(100vh-70px)]',
				'text-primary',
				'dark:text-white',
				'gap-3'
			)}
		>
			{JSON.parse(localStorage.getItem('auth')).loginType === 'anonymous' ? (
				<SignupAnonUser/>
			) : (
				<>
					<section className="min-w-[300px] max-w-[400px] w-[40%] px-10 py-8 rounded-2xl flex flex-col justify-center items-center bg-clip-padding backdrop-filter backdrop-blur-2xl bg-gray-100 dark:bg-opacity-5 dark:bg-gray-300">
						<UserAvatar
							imageUrl={uploadedImageUrl}
							onUploadClick={handleImageUpload}
							onEditClick={handleEditProfile}
						/>

						<input
							className="outline-none bg-transparent w-fit text-center text-2xl placeholder:text-2xl placeholder:text-white"
							onChange={handleUserName}
							placeholder={username}
							value={username}
						/>

						<div className="w-full flex flex-col gap-4">
							<textarea
								className="bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-5 border border-primary dark:border-white text-secondary dark:text-white my-2 bg-transparent outline-none tracking-wider resize-none indent-2 p-2 rounded-xl h-28 w-full placeholder:tracking-widest placeholder:text-center"
								placeholder="Write something about you..."
								ref={aboutRef}
							/>
							<section className="text-lg">
								<div className="border-b-2 border-gray-700 pb-2 flex justify-between tracking-wide items-center">
									<label className="text-primary dark:text-white" htmlFor="gender">
										Gender
									</label>
									<select
										id="genderSelect"
										ref={genderRef}
										className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 bg-transparent dark:bg-gray-700 border-gray-600 placeholder-gray-400 text-primary dark:text-white"
										defaultValue="Unknown"
									>
										<option value="Unknown">Unknown</option>
										<option value="Female">Female</option>
										<option value="Male">Male</option>
									</select>
								</div>
								<div className="flex justify-between tracking-wide items-center">
									<label className="text-primary dark:text-white" htmlFor="age">
										Age
									</label>
									<input
										type="number"
										placeholder="19"
										className="outline-none bg-transparent text-right"
										ref={ageRef}
										min="1"
										onChange={(e) => {
											if (e.target.value < 1) {
												e.target.value = '1';
											}
										}}
									/>
								</div>
							</section>
						</div>
					</section>
					<button
						className="border min-w-[300px] max-w-[400px] w-[40%] p-2 text-md rounded-xl border-green-500 text-green-500 hover:bg-green-500 hover:text-white dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500 dark:hover:text-white"
						onClick={handleUpdateProfile}
					>
						Save changes
					</button>
					<button
						className="border min-w-[300px] max-w-[400px] w-[40%] p-2 text-md rounded-xl border-red text-red hover:bg-red hover:text-white"
						onClick={handleDeleteAccount}
					>
						Delete My Account
					</button>
					{profileResponse ? (
						<div>
							<p className="text-blue-500">{profileResponse}</p>
						</div>
					) : null}
				</>
			)}
		</div>
	);
};

export default Profile;
