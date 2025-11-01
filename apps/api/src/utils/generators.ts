import { customAlphabet } from "nanoid";

export const generateVerificationCode = () => {
	const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);
	return nanoid();
};
