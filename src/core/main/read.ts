const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

/**
 * 读入一行
 */
export function read_Line() {
    return new Promise(resolve => {
        rl.on('line', (str:any) => {
            resolve(str)
        })
    })
}

/**
 * 退出逐行读取
 */
export function close() {
    rl.close()
}
