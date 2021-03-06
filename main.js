// nodeのコアモジュールのhttpを使う
var http = require("http");
//parseする用
var data = "n"

//生死確認の閾値
var threshold = 30;

var isDeadTF = [];

var ServerName = [];

var Network = []
var Network_in = ""
var Network_out = ""

var Disk = []
var Disk_in = ""
var Disk_out = ""

var DiskF = []
var Disk_Total = ""
var Disk_Free = ""

var RAM = ""

var lastaccess =[]


//MySQL
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'me',
    password: 'secret',
    database: 'Server_db'
});

//初回起動
function setup() {
    connection.query('SHOW tables;', function (err, table, fields) {
        if (err) { console.log('err: ' + err); } else {
            var date = new Date();
            var a = date.getTime();
            // 秒単位タイムスタンプ
            var time = Math.floor(a / 1000);

            for (var i = 0; i < table.length; i++) {
                ServerName.push(table[0].Tables_in_Server_db)
                lastaccess.push(time)
                isDeadTF.push(false)
            }
        }
    });
}

setup();

function isDead(){
    var date = new Date();
    var a = date.getTime();
    // 秒単位タイムスタンプ
    var time = Math.floor(a / 1000);

    for(var i=0 ;i <lastaccess.length; i++){
        if((time - lastaccess[i])>threshold){
            //死んだときにする処理
            if(isDeadTF[i]===false){
                //一回だけする処理
                console.log("ALART:Server Named "+ServerName[i]+" may DEAD!!")
                isDeadTF[i]=true;
            }
        }
    }
}

http.createServer(function (req, res) {
    if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('Received');
        res.end();
    } else if (req.method === 'POST') {
        data = "n"
        //POSTデータを受信
        req.on('data', function (chunk) { data += chunk })
            .on('end', function () {
                //data = JSON.parse(data);
                data = JSON.parse(data.slice(1));
                res.end();

                //MariaDBにDataを入れていく
                if (ServerName.indexOf(data.Name) >= 0) {
                    // 存在する
                    // Dateオブジェクトを作成
                    var date = new Date();
                    var a = date.getTime();
                    // 秒単位タイムスタンプ
                    var time = Math.floor(a / 1000);

                    lastaccess[ServerName.indexOf(data.Name)] = time
                    
                    for (var i = 0; i < data.NetworkIO.length; i++) {
                        if(data.NetworkIO[i].Name !== undefined){
                        Network_in += "'" + data.NetworkIO[i].RX + "'" + ","
                        Network_out += "'" + data.NetworkIO[i].TX + "'" + ","
                        }
                    }
                    for (var i = 0; i < data.DiskIO.length; i++) {
                        if(data.DiskIO[i].Name !== undefined){
                        Disk_in += "'" + data.DiskIO[i].IOReadPS + "'" + ","
                        Disk_out += "'" + data.DiskIO[i].IOWritePS + "'" + ","
                        }
                    }
                    for (var i = 0; i < data.DiskFree.length; i++) {
                        if(data.DiskFree[i].Name !== undefined){
                        Disk_Total += "'" + data.DiskFree[i].DiskTotal + "'" + ","
                        Disk_Free += "'" + data.DiskFree[i].DiskFree + "'" + ","
                        }
                    }
                    for (var item in data.RAM) {
                        RAM += "'" + data.RAM[item] + "'" + ",";
                    }
                    connection.query("INSERT INTO " + data.Name + " VALUE ('" + time + "'," + Network_in + Network_out + Disk_in + Disk_out + RAM + Disk_Total + Disk_Free + data.CPU_IOWait + ");")
                    Network_in = []
                    Network_out = []
                    Disk_in = []
                    Disk_out = []
                    Disk_Total = []
                    Disk_Free = []
                    RAM = []
                    Network = []
                    Disk = []
                    DiskF = []

                } else {
                    var date = new Date();
                    var a = date.getTime();
                    // 秒単位タイムスタンプ
                    var time = Math.floor(a / 1000);

                    ServerName.push(data.Name)
                    lastaccess.push(time)
                    isDeadTF.push(false)

                    for (var i = 0; i < data.NetworkIO.length; i++) {
                        if(data.NetworkIO[i].Name !== undefined){
                        Network[i] = data.NetworkIO[i].Name
                        Network_in += "`Network_in_" + Network[i] + "` float unsigned NOT NULL,"
                        Network_out += "`Network_out_" + Network[i] + "` float unsigned NOT NULL,"
                        }
                    }
                    for (var i = 0; i < data.DiskIO.length; i++) {
                        if(data.DiskIO[i].Name !== undefined){
                        Disk[i] = data.DiskIO[i].Name
                        Disk_in += "`Disk_in_" + Disk[i] + "` float unsigned NOT NULL,"
                        Disk_out += "`Disk_out_" + Disk[i] + "` float unsigned NOT NULL,"
                        }
                    }
                    for (var i = 0; i < data.DiskFree.length; i++) {
                        if(data.DiskFree[i].Name !== undefined){
                        DiskF[i] = data.DiskFree[i].Name
                        Disk_Total += "`Disk_Total_" + Disk[i] + "` int(10) unsigned NOT NULL,"
                        Disk_Free += "`Disk_Free_" + Disk[i] + "` int(10) unsigned NOT NULL,"
                        }
                    }
                    for (var item in data.RAM) {
                        RAM += "`" + item + "` int(10) NOT NULL,";
                    }
                    console.log("CREATE TABLE `" + data.Name + "` (`Time` int(10) unsigned NOT NULL," + Network_in + Network_out + Disk_in + Disk_out + RAM + Disk_Total + Disk_Free + "`CPU_IOWait` float NOT NULL);")
                    connection.query("CREATE TABLE `" + data.Name + "` (`Time` int(10) unsigned NOT NULL," + Network_in + Network_out + Disk_in + Disk_out + RAM + Disk_Total + Disk_Free + "`CPU_IOWait` float NOT NULL);")
                    Network_in = []
                    Network_out = []
                    Disk_in = []
                    Disk_out = []
                    Disk_Total = []
                    Disk_Free = []
                    RAM = []
                    Network = []
                    Disk = []
                    DiskF = []
                }
                console.log(data.Name)
            })
    }
}).listen(3000);

setInterval(isDead,1000)

// サーバを待ち受け状態にする
// 第1引数: ポート番号
// 第2引数: IPアドレス
