import BuddyMatcher from "src/components/BuddyMatcher";
import { ChatProvider } from "src/context/ChatContext";


const MatchFound = () => {
	return (
		<ChatProvider>
			<BuddyMatcher />
		</ChatProvider>
	);
};

export default MatchFound;
