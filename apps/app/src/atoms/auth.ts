import { atom } from "jotai";
import type { User } from "db/types";

export const isAuthAtom = atom<boolean>(false);
export const userAtom = atom<User | null>(null);
