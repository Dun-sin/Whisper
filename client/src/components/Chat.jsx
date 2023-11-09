/* eslint-disable max-len */
import { useEffect, useRef, useContext, useMemo, useState } from 'react';
import { SocketContext } from 'context/Context';

import ScrollToBottom from 'react-scroll-to-bottom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

import { v4 as uuid } from 'uuid';
import { throttle } from 'lodash';
import MarkdownIt from 'markdown-it';
import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/data/en.json'

import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';
import { useApp } from 'src/context/AppContext';

import useChatUtils from 'src/lib/chatSocket';
import MessageStatus from './MessageStatus';
import { useNotification } from 'src/lib/notification';
import {
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_RECEIVE_MESSAGE,
	NEW_EVENT_TYPING,
	NEW_EVENT_READ_MESSAGE,
	NEW_EVENT_SEND_FAILED, 
	NEW_EVENT_REQUEST_PUBLIC_KEY
} from '../../../constants.json';
import { createBrowserNotification } from 'src/lib/browserNotification';

import chatHelper,
{
	adjustTextareaHeight,
	checkPartnerResponse,
	getTime
} from '../lib/chatHelper';

import MessageSeen from './Chat/MessageSeen';
import MessageInput from './Chat/MessageInput';
import DropDownOptions from './Chat/DropDownOption';
import PreviousMessages from './Chat/PreviousMessages';
import decryptMessage from 'src/lib/decryptMessage';
// import decryptMessage from 'src/lib/decryptMessage';

const inactiveTimeThreshold = 180000; // 3 mins delay
let senderId;
let inactiveTimeOut;

const Chat = () => {
	const { app } = useApp();
	const { playNotification } = useNotification();
	const [editing, setEditing] = useState({
		isediting: false,
		messageID: null,
	});
	const [isQuoteReply, setIsQuoteReply] = useState(false);
	const [message, setMessage] = useState('');
	const [quoteMessage, setQuoteMessage] = useState(null);
	const [decryptedMessages, setDecryptedMessages] = useState();
	// use the id so we can track what message's previousMessage is open
	const [openPreviousMessages, setOpenPreviousMessages] = useState(null);
	const [badwordChoices, setBadwordChoices] = useState({});
	const [cryptoKey, setCryptoKey] = useState({});
	const [importedPublicKey, setImportedPublicKey] = useState(null);
	const { messages: state, addMessage, updateMessage, removeMessage, receiveMessage } = useChat();
	const { authState, dispatchAuth } = useAuth();
	const { logout } = useKindeAuth();
	const socket = useContext(SocketContext);

	const { sendMessage, editMessage } = useChatUtils(socket);
	const { getMessage, handleResend } = chatHelper(state, app);


	const inputRef = useRef('');

	const [lastMessageTime, setLastMessageTime] = useState(null);

	senderId = authState.loginId;

	const md = new MarkdownIt({
		html: false,
		linkify: true,
		typographer: true,
	});

	const badwords = new BadWordsNext({ data: en })

	function logOut() {
		dispatchAuth({
			type: 'LOGOUT',
		});
		logout();
	}

	const cancelEdit = () => {
		inputRef.current.value = '';
		setEditing({ isediting: false, messageID: null });
		socket.timeout(10000).emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: false });
	};

	const sortedMessages = useMemo(
		 () =>
			  Object.values(state[app.currentChatId]?.messages ?? {})?.sort((a, b) => {
				const da = new Date(a.time),
					db = new Date(b.time);
				return da - db;
			}) 
		,
		[state, app.currentChatId]
	);	
	  
	const arrayBufferToBase64 = (arrayBuffer) => {
		let binary = '';
		const bytes = new Uint8Array(arrayBuffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
		  binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	};

	const doSend = async ({ senderId, room, message, time, containsBadword }) => {
		let encryptedMessage;
		if (!cryptoKey) {
			console.error('Encryption key not generated yet.');
			return;
		  }
	  
		  const encoder = new TextEncoder();
		  const encryptedMessagersa = await crypto.subtle.encrypt(
			{
			  name: 'RSA-OAEP'
			},
			importedPublicKey,
			encoder.encode(message)
		  );
	  
		  // Convert the Uint8Array to Base64 string
		  encryptedMessage = arrayBufferToBase64(new Uint8Array(encryptedMessagersa));
		
		try {
			const sentMessage = await sendMessage({
				senderId,
				encryptedMessage,
				time,
				chatId: room,
				containsBadword
			});
			addMessage({
				senderId,
				room,
				id: sentMessage.id,
				message,
				time,
				status: 'pending',
				containsBadword
			});

			try {
				updateMessage({
					...sentMessage,
					message: message
				});
			} catch {
				logOut();
				return false;
			}
		} catch (e) {
			try {
				updateMessage({
					senderId,
					room,
					id: uuid(),
					message,
					time,
					status: 'failed',
					containsBadword
				});
			} catch {
				logOut();
			}

			return false;
		}

		return true;
	};

	// Here whenever user will submit message it will be send to the server
	const handleSubmit = async (e) => {
		e.preventDefault();

		socket.emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: false });
		const d = new Date();
		let message = inputRef.current.value.trim(); // Trim the message to remove the extra spaces

		if (!isQuoteReply) {
			const cleanedText = message.replace(/>+/g, '');
			message = cleanedText;
		}

		if (message === '' || senderId === undefined || senderId === '123456') {
			return;
		}

		if (isQuoteReply && message.trim() === quoteMessage.trim()) {
			return;
		}

		setIsQuoteReply(false);
		setQuoteMessage(null);


		if (editing.isediting === true) {
			try {
				const messageObject = getMessage(editing.messageID, state, app)
				const oldMessage = messageObject.message;
				const editedMessage = await editMessage({
					id: editing.messageID,
					chatId: app.currentChatId,
					newMessage: message,
					oldMessage,
				});

				updateMessage({ ...editedMessage, room: app.currentChatId }, true);
			} catch (e) {
				setEditing({ isediting: false, messageID: null });
				return;
			}
			setEditing({ isediting: false, messageID: null });
		} else {
			doSend({
				senderId,
				room: app.currentChatId,
				message,
				time: d.getTime(),
				containsBadword: badwords.check(message)
			});
		}

		if (inputRef.current) {
			inputRef.current.value = '';
			setMessage('');
			inputRef.current.focus();
		}
	};

	const handleTypingStatus = throttle((e) => {
		if (e.target.value.length > 0) {
			socket.timeout(5000).emit(NEW_EVENT_TYPING, { chatId: app.currentChatId, isTyping: true });
		}
		setMessage(e.target.value);
		adjustTextareaHeight(inputRef);
		e.target.style.height = '48px';
		e.target.style.height = `${e.target.scrollHeight}px`;
	}, 500);

	const openPreviousEdit = (messageId) => {
		if (openPreviousMessages === messageId) {
			setOpenPreviousMessages(null);
		} else {
			setOpenPreviousMessages(messageId);
		}
	};


	const hideBadword = (id) => {
		setBadwordChoices({ ...badwordChoices, [id]: 'hide' });
	};

	const showBadword = (id) => {
		setBadwordChoices({ ...badwordChoices, [id]: 'show' });
	};

	// Clear chat when escape is pressed
	useEffect(() => {
		const keyDownHandler = (event) => {
			if (event.key === 'Escape' && editing.isediting) {
				event.preventDefault();
				cancelEdit();
			}
		};

		document.addEventListener('keydown', keyDownHandler);

		return () => {
			document.removeEventListener('keydown', keyDownHandler);
		};
	}, [editing]);

	useEffect(() => {
		const newMessageHandler = (message) => {
			try {
				addMessage(message);
				playNotification('newMessage');
				createBrowserNotification('You received a new message on Whisper', message.message);
			} catch {
				logOut();
			}
		};
		const deleteMessageHandler = ({ id, chatId }) => {
			removeMessage(id, chatId);
		};

		const editMessageHandler = (messageEdited) => {
			updateMessage({ ...messageEdited, room: app.currentChatId }, true);
		};
		
		const limitMessageHandler = (data) => {
			alert(data.message);
		};

		const readMessageHandler = ({ messageId, chatId }) => {
			receiveMessage(messageId, chatId)
		}

		// This is used to recive message form other user.
		socket.on(NEW_EVENT_RECEIVE_MESSAGE, newMessageHandler);	
		socket.on(NEW_EVENT_DELETE_MESSAGE, deleteMessageHandler);
		socket.on(NEW_EVENT_EDIT_MESSAGE, editMessageHandler);
		socket.on(NEW_EVENT_READ_MESSAGE, readMessageHandler)
		socket.on(NEW_EVENT_SEND_FAILED, limitMessageHandler);

		return () => {
			socket.off(NEW_EVENT_RECEIVE_MESSAGE, newMessageHandler);
			socket.off(NEW_EVENT_DELETE_MESSAGE, deleteMessageHandler);
			socket.off(NEW_EVENT_EDIT_MESSAGE, editMessageHandler);
			socket.off(NEW_EVENT_READ_MESSAGE, readMessageHandler)
			socket.off(NEW_EVENT_SEND_FAILED, limitMessageHandler);
		};
	}, []);

	useEffect(() => {
		const newLastMessageTime = sortedMessages
			.filter((message) => message.senderId !== senderId)
			.pop()?.time;
		if (newLastMessageTime !== lastMessageTime) {
			setLastMessageTime(newLastMessageTime);
			clearTimeout(inactiveTimeOut);
			inactiveTimeOut = setTimeout(() => {
				checkPartnerResponse(lastMessageTime, inactiveTimeThreshold);
			}, inactiveTimeThreshold);

		}
	}, [sortedMessages]);

	const importKey = async (arrayBuffer) => {
		const storedPublicKey = localStorage.getItem('importPublicKey' + app.currentChatId);
		const publicKeyArray = new Uint8Array(JSON.parse(storedPublicKey));

		const importedPublicKey = await crypto.subtle.importKey(
			'spki',
			storedPublicKey ? publicKeyArray : arrayBuffer,
			{
				name: 'RSA-OAEP',
				hash: { name: 'SHA-256' }
			},
			true,
			['encrypt']
			)
				console.log(importedPublicKey);
				setImportedPublicKey(importedPublicKey);
				if(!storedPublicKey){
				const exportedPublicKey = await crypto.subtle.exportKey(
					'spki',
					importedPublicKey
				  );
				  const publicKeyArray = new Uint8Array(exportedPublicKey);
				  localStorage.setItem("importPublicKey" + app.currentChatId , JSON.stringify(Array.from(publicKeyArray)));
				}
			
	}
	const convertArrayBufferToPem = (arrayBuffer, type) => {
		const buffer = new Uint8Array(arrayBuffer);
		const base64String = btoa(String.fromCharCode.apply(null, buffer));
		return `-----BEGIN ${type}-----\n${base64String}\n-----END ${type}-----`;
	  };

	  function pemToArrayBuffer(pemString) {
		const base64String = pemString && pemString
		  .replace(/-----BEGIN (.+)-----/, '')
		  .replace(/-----END (.+)-----/, '')
		  .replace(/\s/g, '');
	  
		const binaryString = atob(base64String);
		const byteArray = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
		  byteArray[i] = binaryString.charCodeAt(i);
		}
	  
		return byteArray.buffer;
	  }
	  
	const generateKeyPair = async () => {
		const storedCryptoKey = localStorage.getItem('cryptoKey' + app.currentChatId);
		let pemPublicKey;
		const keyPair = await crypto.subtle.generateKey(
			{
			  name: 'RSA-OAEP',
			  modulusLength: 2048,
			  publicExponent: new Uint8Array([1, 0, 1]),
			  hash: 'SHA-256'
			},
			true,
			['encrypt', 'decrypt']
		  );
  if (storedCryptoKey) {
	const privateKeyArray = new Uint8Array(JSON.parse(storedCryptoKey));
	
	crypto.subtle.importKey(
		'pkcs8',
		privateKeyArray,
		{
			name: 'RSA-OAEP',
			hash: { name: 'SHA-256' }
		},
		true,
		['decrypt']
		).then((importedPrivateKey) => {
			setCryptoKey(importedPrivateKey);
			console.log(importedPrivateKey);
		});
  } else {
		
		setCryptoKey(keyPair.privateKey);
		const exportedPrivateKey = await crypto.subtle.exportKey(
			'pkcs8',
			keyPair.privateKey
		);
		const privateKeyArray = new Uint8Array(exportedPrivateKey);
		localStorage.setItem("cryptoKey" + app.currentChatId , JSON.stringify(Array.from(privateKeyArray)));
		}
		const exportedPublicKey = await crypto.subtle.exportKey(
			'spki',
			keyPair.publicKey
		  );
		  pemPublicKey = convertArrayBufferToPem(exportedPublicKey, 'PUBLIC KEY');
		socket.emit(NEW_EVENT_REQUEST_PUBLIC_KEY, {
			chatId: app.currentChatId,
			publicKey: pemPublicKey
		  });
	  };

	useEffect(() => {
		generateKeyPair();
		const publicStringHandler = (pemPublicKeyString) => {
			console.log(pemPublicKeyString);
			const pemPublicKeyArrayBuffer = pemToArrayBuffer(pemPublicKeyString);

			// Import PEM-formatted public key as CryptoKey
			importKey(pemPublicKeyArrayBuffer);
		}
		socket.on('publicKey', publicStringHandler); 
		return () => {
			socket.off('publicKey', publicStringHandler);
		}
	}, []);

	useEffect(() => {
		const fetchData = async () => {
		  const decryptedPromises = sortedMessages.map(async ({ message, senderId: sender, ...rest }) => {
			if (sender.toString() === senderId.toString()) {
				return {
				  ...rest,
				  senderId: senderId,
				  message
				};
			  }
	  
			  try {
				const finalMessage = await decryptMessage(message, cryptoKey);
				return {
				  ...rest,
				  senderId: sender,
				  message: finalMessage || message // Use the decrypted message, or fallback to the original message
				};
			  } catch (error) {
				// Handle decryption errors if necessary
				console.error('Decryption error:', error);
				return {
				  ...rest,
				  senderId: sender,
				  message: message // Use the original message in case of decryption error
				};
			  }
		  });
	
		  const decryptedMessages = await Promise.all(decryptedPromises);
		  console.log(decryptedMessages);
		  setDecryptedMessages(decryptedMessages);
		};
	
		fetchData();
	  }, [sortedMessages, cryptoKey]);

	return (
		<div className="w-full md:h-[90%] min-h-[100%] pb-[25px] flex flex-col justify-between gap-6">
			<div className="max-h-[67vh]">
				<p className="text-[0.8em] font-semibold mb-[10px] mt-[20px] text-center">
					Connected with a random User
					{sortedMessages.length === 0 && ', Be the first to send {"Hello"}'}
				</p>
				<ScrollToBottom
					initialScrollBehavior="auto"
					className="h-[100%] md:max-h-full overflow-y-auto w-full scroll-smooth"
				>
					{decryptedMessages && decryptedMessages.map(
						({ senderId: sender, id, message, time, status, isEdited, oldMessages, containsBadword, isRead }) => {
							const isSender = sender.toString() === senderId.toString();	
							return (
								<div
									key={id}
									id={!isSender && `message-${id}`}
									className={`w-full flex text-white relative mb-2 ${
										isSender ? 'justify-end' : 'justify-start'
									}`}
								>
									<div
										className={`flex flex-col mb-[2px] min-w-[10px] mdl:max-w-[80%] max-w-[50%] ${
											isSender ? 'items-end' : 'items-start'
										}`}
									>
										{containsBadword && !isSender && !badwordChoices[id] ? (
											<div className='flex flex-col border-red border w-full rounded-r-md p-3'>
												<p>Your buddy is trying to send you a bad word</p>
												<div className='flex w-full gap-6'>
													<span onClick={() => showBadword(id)} className='text-sm cursor-pointer'>See</span>
													<span onClick={() => hideBadword(id)} className='text-red text-sm cursor-pointer'>Hide</span>
												</div>
											</div>
										)
											:
											<>
												<div
													className={`chat bg-red p-3 break-all will-change-auto flex gap-6 items-center text ${isSender
														? 'justify-between bg-secondary rounded-l-md'
														: 'rounded-r-md'
														}`}
												>
													{typeof message === 'string' ? (
														<span dangerouslySetInnerHTML={{
															__html: md.render(
																badwordChoices[id] === 'hide' ? badwords.filter(message) : badwordChoices[id] === 'show' ? message : message)
														}} />
													) : (
														badwordChoices[id] === 'hide' ? badwords.filter(message) : badwordChoices[id] === 'show' ? message : message
													)}

													<DropDownOptions
														isSender={
															isSender
															&& status !== 'pending'}
														id={id}
														inputRef={inputRef}
														cancelEdit={cancelEdit}
														setEditing={setEditing}
														setIsQuoteReply={setIsQuoteReply}
														setQuoteMessage={setQuoteMessage}
													/>
												</div>
												<div
													className={`flex gap-2 items-center ${isSender ? 'flex-row' : 'flex-row-reverse'
														}`}
												>
													<div
														className={`text-[12px] ${status === 'failed' ? 'text-red-600' : 'text-white'
															}`}
													>
														<MessageStatus
															time={getTime(time)}
															status={status ?? 'sent'}
															iAmTheSender={isSender}
															onResend={() => handleResend(id, doSend, state, app)}
														/>
													</div>
													<PreviousMessages
														id={id}
														isSender={isSender}
														isEdited={isEdited}
														openPreviousEdit={openPreviousEdit}
														openPreviousMessages={openPreviousMessages}
														oldMessages={oldMessages}
													/>
												</div>
												<MessageSeen isRead={isRead} isSender={isSender} />
											</>}
									</div>
								</div>
							);
						}
					)}
				</ScrollToBottom>
			</div>

			<MessageInput
				message={message}
				handleTypingStatus={handleTypingStatus}
				setMessage={setMessage}
				editing={editing}
				cancelEdit={cancelEdit}
				handleSubmit={handleSubmit}
				inputRef={inputRef}
			/>
		</div>
	);
};

export default Chat;
