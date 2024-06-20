## Debugging Issue [#610](https://github.com/Dun-sin/Whisper/issues/610)

### Problem Description
The issue stemmed from a failure in sending messages due to the improper exchange of crypto keys. Investigation revealed that users were not being correctly assigned to chat rooms in Socket.IO.

### Solution
#### Delayed Key Exchange
To address the problem, a delay was introduced in the key exchange process. This delay ensured that all users were properly connected before initiating the key exchange. The delay was implemented using the `setTimeout` function set to 3 seconds.

### Explanation
The initial problem occurred because users were attempting to exchange keys before being correctly assigned to chat rooms. By delaying the key exchange, we ensured that all users were fully connected before initiating the process. Specifically, this approach ensured that the client creating the chat (User 1) sent keys only after all participants, including those joining (User 2), were successfully connected. Consequently, User 2 received the necessary keys from User 1, resolving the synchronization issue.

### Implementation Details
- Utilized `setTimeout` function to delay key exchange by 3 seconds.
- Implemented loading screen during initialization to indicate ongoing setup process.
- Ensured that all users, including both creators and joiners, were fully connected before initiating key exchange.

### Result
Implementation of the delay strategy successfully resolved the issue, allowing seamless exchange of crypto keys and enabling uninterrupted message transmission within the chat system.
