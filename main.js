// nodeのコアモジュールのhttpを使う
var http = require("http");
var data = "n"
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
		console.log(data.Name)
            })
    }
}).listen(3000);


// サーバを待ち受け状態にする
// 第1引数: ポート番号
// 第2引数: IPアドレス
