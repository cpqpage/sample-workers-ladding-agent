import dayjs from "dayjs";
import { genRandomNumber } from "./randomNumber";
import checkNumber from "./numberUtil";

const G_STEP = 5;
const G_MULT = 9;
const M_MULT = 4;
const TIME_DIVIDE = 1000;

export const genKey = (type: number, monthCount: number, now: Date) => {
    let f = genRandomNumber(1);
    f = f === '0' ? '8' : f;
    
    const randNumber = f + genRandomNumber(11);
    const g1 = randNumber.substring(0, 4);
    const g2 = randNumber.substring(4, 8);
    const g3 = randNumber.substring(8, 12);

    const date = dayjs(now).format('YYYYMMDDHHmmss');
    const currentDate = dayjs(date).toDate();
    const time = currentDate.getTime();
    
    const start = time / TIME_DIVIDE % 4;
    const end = start + 1;
    
    const checkFront = (Number(g1.substring(start, end))
        + Number(g2.substring(start, end))
        + Number(g3.substring(start, end)) + G_STEP) * G_MULT;
    
    const monthCheck = (monthCount + Number(f)) * M_MULT;
    
    const g4a = (checkFront.toString()).substring(0, 2);
    const g4b = "0" + monthCheck.toString();
    const g4 = g4a + g4b.substring(g4b.length - 2);

    const key = g1 + "-" + g2 + "-" + g3 + "-" + g4;

    if(checkKey(key, monthCount, now)) {
        return key;
    }

    return "";
}

export const checkKey = (key: string, monthCount: number, now: Date) => {
    const keyNumStr = key.replace(/-/g, '');
    if(keyNumStr.length == 16 && checkNumber(keyNumStr, "+")) {
        const g1 = keyNumStr.substring(0, 4);
        const g2 = keyNumStr.substring(4, 8);
        const g3 = keyNumStr.substring(8, 12);
        const f = g1.substring(0, 1);
        
        const date = dayjs(now).format('YYYYMMDDHHmmss');
        const currentDate = dayjs(date).toDate();
        const time = currentDate.getTime();
        
        const start = time / TIME_DIVIDE % 4;
        const end = start + 1;
        
        let gNum = (Number(g1.substring(start, end))
            + Number(g2.substring(start, end))
            + Number(g3.substring(start, end)) + G_STEP) * G_MULT;
        gNum = Number(gNum.toString().substring(0, 2));

        let mNum = (monthCount + Number(f)) * M_MULT;
        mNum = Number("0" + mNum);

        const gvNum = Number(keyNumStr.substring(12, 14));
        const mvNum = Number(keyNumStr.substring(14, 16));
        
        return gNum === gvNum && mNum === mvNum;
    }

    return false;
}