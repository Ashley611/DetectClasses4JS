import * as fs from "fs";

let database = require('arangojs').Database;
let db = new database('http://127.0.0.1:8529');
// 连接
const username = 'root' // default user
const password = '' // blank password by default
// 创建数据库
db.createDatabase('myDataBase').then(
    () => console.log('Database created'),
    (err: any) => console.error('Failed to create database:', err)
);
//创建集合
let colName = "JsNode";
var collection = db.collection(colName);
collection.create().then(
    () => console.log('Collection created'),
    (err: any) => console.error('Failed to create collection:', err)
);
//读取生成的json文件
var jsonFilePath = "F:\\test\\callNew_test\\callNew-out\\callNew_node.json";
var fileContent=fs.readFileSync(jsonFilePath).toString();
//console.log(fileContent.toString());
if(fileContent)
{
    console.log("fileContent .len="+fileContent.length);
    //写入数据库
    var jsonfile=JSON.parse(fileContent);
    db.collection(colName).import(jsonfile,function(err:any,res:any){
        if(err)throw err;
        console.log("json文件写入数据库成功");
        db.close();
    })
}
// let colName = "secondCollection"
// //创建集合，即使集合已经存在，也不会产生异常
// db.createCollection(colName,function(err:any,res:any){
//     console.log("走进安利")
//     if(err)      throw err;
//     console.log("创建集合"+colName+"成功");
//
//     //插入json文件
//     var fileName="F:\\test\\callNew_test\\callNew-out\\callNew_node.json";
//     console.log("读取json文件："+fileName);
//     var fileContent = fs.readFileSync(fileName).toString();
//     console.log(fileContent)
    // if(fileContent)
    // {
    //     console.log("fileContent .len="+fileContent.length);
    //     //写入数据库
    //     var tbfile=JSON.parse(fileContent);
    //     db.collection(colName).insertOne(tbfile,function(err:any,res:any){
    //         if(err)throw err;
    //         console.log("json文件写入数据库成功");
    //         db.close();
    //     })
    // }

// })