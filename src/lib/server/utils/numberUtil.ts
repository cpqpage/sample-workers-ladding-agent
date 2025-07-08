function checkNumber(num: string, type: string): boolean {
    let regex = "";

    if (type === "0+") {
        regex = "^\\d+$"; // 非负整数
    } else if (type === "+") {
        regex = "^\\d*[1-9]\\d*$"; // 正整数
    } else if (type === "-0") {
        regex = "^((-\\d+)|(0+))$"; // 非正整数
    } else if (type === "-") {
        regex = "^-\\d*[1-9]\\d*$"; // 负整数
    } else {
        regex = "^-?\\d+$"; // 整数
    }

    const pattern = new RegExp(regex);
    
    return pattern.test(num);
}

export default checkNumber;