import { ChatProvider } from 'src/context/ChatContext';
import BuddyMatcher from 'src/components/BuddyMatcher';

const Searching = () => {
	return (
		<ChatProvider>
			<BuddyMatcher />
		</ChatProvider>
	);
};

export default Searching;
