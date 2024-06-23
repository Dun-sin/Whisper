<details>
  <summary>Debugging Issue <a href="https://github.com/Dun-sin/Whisper/issues/610">#610</a></summary>

   ### Problem: Initial Key Exchange Failure
   Messages were not being sent due to a failure in the exchange of crypto keys, caused by users attempting to exchange keys before being correctly assigned to chat rooms.

   ### Solution
   To address this, a delay of 3 seconds was introduced in the key exchange process using the `setTimeout` function. This delay ensured that all users were properly connected before initiating the key exchange.

	```
	setTimeout(() => {
	// Key exchange logic
	}, 3000);
	```

   By delaying the key exchange, we ensured that all users were fully connected before initiating the process. Specifically, this approach ensured that the client creating the chat (User 1) sent keys only after all participants, including those joining (User 2), were successfully connected. Consequently, User 2 received the necessary keys from User 1, resolving the synchronization issue.

   ### Problem: Timer Issue in Production
   The timer used in development failed in production, leading to decryption issues. Keys were being sent on every render from both sides instead of being exchanged, causing new socket IDs to be created each time.

   ### Solution
   To resolve this, the process of creating keys was moved to a hook and called after the search successfully ended in BuddyMatcher. This prevented keys from being sent multiple times. However, an issue arose where only one user received the keys due to incorrect placement of the key generation code and multiple function calls.

	 ```
		useEffect(() => {
			generateKeyPair();
		}, [currentChatId]);
		```

   ### Problem: Decryption not working
   The decryption function did not receive the crypto key properly. Although the crypto key was updated in the hook, it did not reflect in the `onNewMessageHandler` function.

   ### Solution
   To fix this, a `useRef` was used to store the crypto key value, which was then used in the `onNewMessageHandler` function.

	```javascript
	const cryptoKeyRef = useRef(null);
	cryptoKeyRef.current = cryptoKey;
	```
</details>