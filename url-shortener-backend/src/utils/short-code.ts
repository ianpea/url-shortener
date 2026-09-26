import {randomInt} from "node:crypto";
import {SHORT_CODE_LEN, CHARACTERS} from "../constants.js";

export function generateShortCode(): string {
    let code = "";
    for(let i = 0; i < SHORT_CODE_LEN; i++) {
        code += CHARACTERS[randomInt(CHARACTERS.length)];
    }
    return code;
}