export const fetchActionWithNoForm = async (url: string, paramObj: object) => {
    const formData = new FormData();
    for(const key in paramObj){
        formData.append(key, paramObj[key as keyof typeof paramObj]);
    }

    const res = await fetch(url, {
        method: 'POST',
        body: formData
    });

    return res;
}

export const getResJson = async (res: Response) => {
    const resJson = await res.json();
    //action 中返回的object对象, {key: value}
    // jsonData 是数组，第一个元素是对象，保存{key: [jsonData的索引]}，第二个开始才是value
    const jsonData = JSON.parse(resJson.data);
    const keyObj = jsonData[0];
    let result: Record<string, unknown> = {};
    for(const key in keyObj){
        result[key] = jsonData[keyObj[key] as keyof typeof keyObj];
        // 如果 result[key] 是对象，那么 result[key] 对象的 key 的value也是指向jsonData的 索引
        // 递归处理嵌套对象，将所有 number 且为 jsonData 索引的值替换为实际对象
        resolveObj(result[key], jsonData);
    }
    return result;
}

function resolveObj(obj: unknown, jsonData: Record<string, unknown>) {
    if (typeof obj === 'object' && obj !== null) {
        for (const subKey in obj as Record<string, unknown>) {
            const val = (obj as Record<string, unknown>)[subKey];
            if (typeof val === 'number' && val in jsonData) {
                (obj as Record<string, unknown>)[subKey] = jsonData[val];
                // 递归处理替换后的对象
                resolveObj((obj as Record<string, unknown>)[subKey], jsonData);
            } else if (typeof val === 'object' && val !== null) {
                resolveObj(val, jsonData);
            }
        }
    }
}