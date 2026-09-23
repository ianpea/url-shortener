import {randomInt} from "node:crypto";

// BASE62
const CHARACTERS =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const SHORT_CODE_LEN = 7;
export function generateShortCode(length = 6): string {
    let code = "";
    for(let i = 0; i < SHORT_CODE_LEN; i++) {
        code += CHARACTERS[randomInt(CHARACTERS.length)];
    }
    return code;
}