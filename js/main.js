// キャンパスのお絵かき機能
// https://mam-mam.net/mytech/show.php?cd=160から丸写し
var can;
var ct;
var ox=0,oy=0,x=0,y=0;
var mf=false;
function mam_draw_init(){
  //初期設定
  can=document.getElementById("draw-area");
  can.addEventListener("touchstart",onDown,false);
  can.addEventListener("touchmove",onMove,false);
  can.addEventListener("touchend",onUp,false);
  can.addEventListener("mousedown",onMouseDown,false);
  can.addEventListener("mousemove",onMouseMove,false);
  can.addEventListener("mouseup",onMouseUp,false);
  ct=can.getContext("2d");
  ct.strokeStyle="#000000";
  ct.lineWidth=5;
  ct.lineJoin="round";
  ct.lineCap="round";
  clearCan();
}
function onDown(event){
  mf=true;
  ox=event.touches[0].pageX-event.target.getBoundingClientRect().left;
  oy=event.touches[0].pageY-event.target.getBoundingClientRect().top;
  event.stopPropagation();
}
function onMove(event){
  if(mf){
    x=event.touches[0].pageX-event.target.getBoundingClientRect().left;
    y=event.touches[0].pageY-event.target.getBoundingClientRect().top;
    drawLine();
    ox=x;
    oy=y;
    event.preventDefault();
    event.stopPropagation();
  }
}
function onUp(event){
  mf=false;
  event.stopPropagation();
}

function onMouseDown(event){
  ox=event.clientX-event.target.getBoundingClientRect().left;
  oy=event.clientY-event.target.getBoundingClientRect().top ;
  mf=true;
}
function onMouseMove(event){
  if(mf){
    x=event.clientX-event.target.getBoundingClientRect().left;
    y=event.clientY-event.target.getBoundingClientRect().top ;
    drawLine();
    ox=x;
    oy=y;
  }
}
function onMouseUp(event){
  mf=false;
}
function drawLine(){
  ct.beginPath();
  ct.moveTo(ox,oy);
  ct.lineTo(x,y);
  ct.stroke();
}
function clearCan(){
  // 画像アップロード時はサイズも変わるので、ここで400,400に戻す処理を追加
  can.setAttribute("width",400);
  can.setAttribute("height",400);
  ct.fillStyle="rgb(255,255,255)";
  ct.fillRect(0,0,can.getBoundingClientRect().width,can.getBoundingClientRect().height);
}

// judgeボタン
$(function() {
  $('#judgeButton').click(function(event) {
    let imageData = can.toDataURL("image/jpeg");
    data = { "sendValue": imageData }
    $.ajax({
      url: "cgi-bin/cgi_test.py",
      type: "POST",
      data: data,

      beforeSend: function(){
        $(".loading").removeClass("hide");
      }

    }).done(function(data) {
      $(".loading").addClass("hide");
      $(".result").html(data);
    }).fail(function(xhr, err){
      console.log(err);
      alert("エラーが発生しました。ページを更新して再度実行するか、しばらく時間をおいてください。")
    });
  });
});

// 画像アップロード機能
// https://www.webprofessional.jp/jquery-document-ready-plain-javascript/
// https://qiita.com/michimaru/items/595cbf090569bfab2d20
$(window).on("load", function(){
  $("#imageuploader").change(function() {
    let file = this.files[0];
    if (!file.type.match(/^image\/(png|jpeg|gif)$/)) return;

    let image = new Image();
    let reader = new FileReader();

    reader.onload = function(evt) {
        image.onload = function() {
            let imageWidth = image.width
            let imageHeight = image.height
            let dstWidth = image.width
            let dstHeight = image.height

            // 画像サイズが400pxより大きい場合は長い辺を400pxに縮小する
            let maxWidthHeight = Math.max(imageWidth, imageHeight)
            if (maxWidthHeight > 400) {
              let scale = 400 / maxWidthHeight
              dstWidth = imageWidth * scale
              dstHeight = imageHeight * scale
            }

            $("#draw-area").attr("width",dstWidth);
            $("#draw-area").attr("height",dstHeight);

            let canvas = $("#draw-area");
            let ctx = canvas[0].getContext("2d");
            ctx.drawImage(image, 0, 0, imageWidth, imageHeight, 0, 0, dstWidth, dstHeight); //canvasに画像を転写
        }
        image.src = evt.target.result;
    }
    reader.readAsDataURL(file);
  });
});
