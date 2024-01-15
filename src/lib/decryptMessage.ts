import CryptoJS from 'crypto-js';

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

export default (message: string) => {
  if (!secretKey) {
    return;
  }

  const bytes = CryptoJS.AES.decrypt(message, secretKey);
  const originalMessage = bytes.toString(CryptoJS.enc.Utf8);

  return originalMessage;
};
