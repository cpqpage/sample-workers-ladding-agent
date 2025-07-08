export const genRandomNumber = (len: number)=>{
    const maxNum = 36;
    const str = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let i = 0;
    let count = 0;
    let num = "";

    while(count < len){
        i = Math.abs(getRandomInt(maxNum))
        if (i >= 0 && i < str.length) {
            num +=(str[i]);
            count++;
        }
    }
    return num;
}

const getRandomInt = (max: number) => Math.floor(Math.random() * max);