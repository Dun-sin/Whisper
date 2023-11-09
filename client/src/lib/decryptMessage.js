export default async (message, cryptoKey) => {
  const encryptedMessageUint8Array = new Uint8Array(atob(message).split('').map(char => char.charCodeAt(0)));
  try{
    const decryptedMessageBuffer = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      cryptoKey,
      encryptedMessageUint8Array
    );
    const decoder = new TextDecoder();
    const decryptedMessage = decoder.decode(decryptedMessageBuffer)
    console.log(decryptedMessage);
    return decryptedMessage;
    } catch (error) {
      console.log(error);
    }
}





  
  








