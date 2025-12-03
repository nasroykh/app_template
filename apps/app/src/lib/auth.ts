import { isAuthAtom, userAtom } from "@/atoms/auth";
import { useAtomValue } from "jotai";
import cookies from "js-cookie";

export const isAuth = () => {
	const token = cookies.get("auth_access_token");
	if (!token) {
		return false;
	}

	const isAuth = useAtomValue(isAuthAtom);
	if (!isAuth) {
		return false;
	}

	const user = useAtomValue(userAtom);
	if (!user) {
		return false;
	}

	return isAuth;
};
