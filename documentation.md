<details>
  <summary>Debugging Issue <a href="https://github.com/Dun-sin/Whisper/issues/610">#610</a></summary>

   ### Problem 1: Initial Key Exchange Failure
   The issue stemmed from a failure in sending messages due to the improper exchange of crypto keys. The problem occurred because users were attempting to exchange keys before being correctly assigned to chat rooms.

   ### Solution 1
   To address the problem, a delay was introduced in the key exchange process. This delay ensured that all users were properly connected before initiating the key exchange. The delay was implemented using the `setTimeout` function set to 3 seconds.

	```
	setTimeout(() => {
	// Key exchange logic
	}, 3000);
	```

	By delaying the key exchange, we ensured that all users were fully connected before initiating the process. Specifically, this approach ensured that the client creating the chat (User 1) sent keys only after all participants, including those joining (User 2), were successfully connected. Consequently, User 2 received the necessary keys from User 1, resolving the synchronization issue.

   ### Problem 2: Timer Issue in Production
 	Putting a timer worked great in development but failed in production. Messages can't be decrypted on both ends even when the keys are successfully exchanged. Instead of the keys being exchanged, they're being sent on every render from both sides, which leads back to the original problem. Each time an event for the keys is sent, it's a new socket ID.
   

   ### Solution 2
   Moved the process of creating keys to a hook and called the generate keypair after the search has successfully ended in BuddyMatcher. Calling the hook only in the BuddyMatcher component prevented it from rendering every time and sending the keys just once. However, we encountered the issue of only one user getting the code. The render issue was because I put this in the hook's code and was also calling the function in the BuddyMatcher which caused multiple renderings.
	 ```
		useEffect(() => {
			generateKeyPair();
		}, [currentChatId]);
		```

	 ### Problem 3
	 Putting the generateKeyPair in the BuddyMatcher component actually made it worse, as it now doesn't send to anyone because no one is initially in the room.
	 ```
	 	socket.on(NEW_EVENT_JOINED, ({ roomId, userIds }) => {
		playNotification('buddyPaired');
		createBrowserNotification(
			"Let's Chat :)",
			"You've found a match, don't keep your Partner waiting ⌛"
		);
		createChat(roomId, userIds);
		endSearch(roomId);

		generateKeyPair();
		});
	```

	On investigation, i found out that on each render we get a new id, since that can't be changed, i changed the code to send the current user chat rooom id on every connect, on the server whenever a new connect happens and we have a chatid with it, it joins the room for us, that way they can always be in the room, this fixed the issue of users not receieving each others crypto keys cuz now they are properly in the same room.

	### Problem 3 - Decryption not working
	Seems like decryption function doesn't get the crypto key to decrypt properly

	### Solution 3
	



	 #### Things to try
	 - track how user ids get added to room when users join
	 - console.log to see which happens first between the requestpublickeys and join event handlers
</details>