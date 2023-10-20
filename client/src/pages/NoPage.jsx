import { Link } from 'react-router-dom';

const NoPage = () => {
	return (
		<div className="bg-light text-primary dark:text-light dark:bg-primary md:min-w-[calc(100%-120px)] flex items-center justify-center text-center">
			<div>
				<h1 className="text-9xl font-bold">404</h1>
				<p className="text-3xl">Sorry, Page Not found!</p>

				<Link
					to={'/'}
					className="block w-max py-2 mt-6 mx-auto px-4 bg-[#FF9F1C] hover:bg-[#FBBF24] text-black text-xl text-center rounded-full hover:no-underline"
				>
					Go Back Home
				</Link>
			</div>
		</div>
	);
};

export default NoPage;
