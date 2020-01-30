// nodeのコアモジュールのhttpを使う
var http = require("http");


http.createServer(function (req, res) {
    if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('Received');
        res.end();
    } else if (req.method === 'POST') {
        //POSTデータを受信
        req.on('data', function (chunk) { data += chunk })
            .on('end', function () {

                console.log(data);
                res.end();

            })
    }
}).listen(513);


// サーバを待ち受け状態にする
// 第1引数: ポート番号
// 第2引数: IPアドレス