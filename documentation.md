<details>
  <summary>Debugging Issue <a href="https://github.com/Dun-sin/Whisper/issues/610">#610</a></summary>

   ### Problem
   The issue stemmed from a failure in sending messages due to the improper exchange of crypto keys.  The problem occurred because users were attempting to exchange keys before being correctly assigned to chat rooms.

   ### Solution
   To address the problem, a delay was introduced in the key exchange process. This delay ensured that all users were properly connected before initiating the key exchange. The delay was implemented using the `setTimeout` function set to 3 seconds.

   By delaying the key exchange, we ensured that all users were fully connected before initiating the process. Specifically, this approach ensured that the client creating the chat (User 1) sent keys only after all participants, including those joining (User 2), were successfully connected. Consequently, User 2 received the necessary keys from User 1, resolving the synchronization issue.

   ### Problem
   Putting a timer worked great in development but failed in production. Message can't be decrypted on both ends even when the keys successfully exchange. 
   
   Instead of the keys being exchanged, it's being sent on every render from both sides but still getting to one side, which is leading us back to the original problem

	Each time an event for the keys is sent, it's a new socket id
   

   ### Solution
   Moved the process of creating keys to being in a hook and called the generate keypair after the search has successfully ended in `BuddyMatcher`. 
   
   Calling the hook only in the BuddyMatcher component prevented it from rendering everytime and sending the keys just once, but we're back to the problem of only one user getting the code. The render issue was because i put this in the hooks code and was also calling the function in the buddy matcher which
	 caused multiple rendering
	 ```
		useEffect(() => {
			generateKeyPair();
		}, [currentChatId]);
		```

	 This also fixed the issue of socket ids being different everytime

	 ### Problem
	 Putting the generateKeyPair in buddy matcher component actually makes it worse and it now doesn't send to anyone because no one is in the room initally
	 ```
	 	socket.on(NEW_EVENT_JOINED, ({ roomId, userIds }) => {
			playNotification('buddyPaired');
			createBrowserNotification(
				"Let's Chat :)",
				"You've found a match, don't keep your Partner waiting ⌛"
			);
			createChat(roomId, userIds);
			endSearch(roomId);

			console.log('sending', new Date())
			generateKeyPair()
		});
	 ```
</details>