var QR=require("qrcode");
var http=require("http");
var https=require("https");
var express=require('express');
var fs=require('fs');
var app=express();


app.use(express.static(__dirname + '/public'));
app.set("views",__dirname+"/views");


var listenPort=3100;

var server=app.listen(listenPort,function(){
    console.log("http server ok");
});

app.get("/text",function(req,res){
	var string=req.query.txt;
	QR.draw(string,{"errorCorrectLevel":"high"},function(err,canvas,Canvas){
		var mid_w=canvas.width/2,
		mid_h=canvas.height/2;
		var smallFill=mid_w*0.2;
		var ctx=canvas.getContext("2d");
		var img=new Canvas.Image;
		var buf=fs.readFileSync("./image/logo.jpg");
		img.src=buf;
		ctx.drawImage(img,parseInt(mid_w-smallFill),parseInt(mid_h-smallFill),parseInt(smallFill*2),parseInt(smallFill*2));

		/*
		var tempC=new Canvas();
		tempC.width=200;
		tempC.height=200;
		var ctx2=tempC.getContext("2d");
		ctx2.drawImage(canvas,0,0,200,200);
		*/

	 	var stream = canvas.createJPEGStream({
				  bufsize : 204800,
				  quality :100
			});
		var length=0;
		var chunkAry=[];
		stream.on('data', function(chunk){
			length+=chunk.length;
			chunkAry.push(chunk);
		});

		stream.on('end', function(){
			var buf=new Buffer(length);
			for(var i=0;i<chunkAry.length;i++){
				if(i==0){
					chunkAry[i].copy(buf,0);
				}else{
					chunkAry[i].copy(buf,chunkAry[i-1].length);
				}
			}
		res.writeHead(200, {"Cache-Control":"max-age=86400",'Content-Type': 'image/jpg' });
		res.end(buf, 'binary');
		//	callback(null,buf);
		});
	});
});
