//====================================================
// GÓC BẮN BÍ MẬT
// PHIÊN BẢN 4 - KIẾN TRÚC MỚI
//====================================================

//====================================================
// Canvas
//====================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//====================================================
// Điều khiển
//====================================================

const slider = document.getElementById("angleSlider");
const angleText = document.getElementById("angleValue");

const fireBtn = document.getElementById("fireBtn");
const traceBtn = document.getElementById("traceBtn");
const randomBtn = document.getElementById("randomBtn");
const teacherBtn = document.getElementById("teacherBtn");

//====================================================
// Trạng thái trò chơi
//====================================================

let angle = 45;

let showTrace = false;

let teacherMode = false;

let traces = [];

let message = "";

let bullet = null;

//====================================================
// THÔNG SỐ BÀI TOÁN
//====================================================

// Giáo viên chỉ thay đổi các thông số này

const PROBLEM_V0 = 600;      // m/s

const PROBLEM_G = 9.8;      // m/s²

// Khoảng cách thật từ pháo đến mục tiêu (m)

let problemDistance = 150;

//====================================================
// THÔNG SỐ MÔ PHỎNG
//====================================================

// Hệ số phóng đại hoạt ảnh
const SIM_SCALE = 0.001;

// Vận tốc mô phỏng (được suy ra từ vận tốc thật)
const SIM_V0 = 15;

// Gia tốc mô phỏng (cùng tỷ lệ)
const SIM_G = 0.245;


//====================================================
// KÍCH THƯỚC SÂN CHƠI
//====================================================

const cannonX = 80;

const cannonY = 500;

// vùng có thể đặt bia


const TARGET_RADIUS = 18;

const PLAY_LEFT = cannonX;

const PLAY_RIGHT = 900;

const PLAY_WIDTH = PLAY_RIGHT - PLAY_LEFT;

//====================================================
// HIỆU CHỈNH
//====================================================

// Tầm bắn lớn nhất của bài toán

const REAL_MAX_RANGE =
    PROBLEM_V0 * PROBLEM_V0 / PROBLEM_G;

// Hệ số đổi mét -> pixel

const PIXEL_PER_METER =
    PLAY_WIDTH / REAL_MAX_RANGE;

//====================================================
// VỊ TRÍ MỤC TIÊU
//====================================================

let targetX =
    cannonX +
    problemDistance * PIXEL_PER_METER;

const targetY = 500;

//====================================================
// Cập nhật vị trí bia theo khoảng cách
//====================================================

function updateTargetPosition(){

    targetX =
        cannonX +
        problemDistance *
        PIXEL_PER_METER;

}

//====================================================
// Thanh kéo góc
//====================================================

slider.oninput = function(){

    angle = parseInt(this.value);

    angleText.innerHTML = angle;

}

//====================================================
// Nút bắn
//====================================================

fireBtn.onclick = function(){

    fire();

}
//====================================================


slider.oninput = function () {

    angle = parseInt(this.value);

    angleText.innerHTML = angle;

    draw();

}

fireBtn.onclick = function () {

    fire();

}

//=========================
// Bắn
//=========================

function fire(){

    let rad = angle * Math.PI / 180;

    bullet = {

        x : cannonX,
        y : cannonY,

        vx : Math.cos(rad) * SIM_V0,

        vy : -Math.sin(rad) * SIM_V0,

        flying : true

    };

    traces = [];

    message = "";

}

//=========================
// Mặt đất
//=========================

function drawGround(){

    ctx.strokeStyle = "#228B22";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0,cannonY);
    ctx.lineTo(canvas.width,cannonY);
    ctx.stroke();

}


//=========================
// Pháo
//=========================

function drawCannon(){

    const rad = angle*Math.PI/180;

    const len = 55;

    const x2 = cannonX + Math.cos(rad)*len;
    const y2 = cannonY - Math.sin(rad)*len;

    // thân pháo
    ctx.strokeStyle="#333";
    ctx.lineWidth=12;

    ctx.beginPath();
    ctx.moveTo(cannonX,cannonY);
    ctx.lineTo(x2,y2);
    ctx.stroke();

    // bệ pháo
    ctx.fillStyle="#666";

    ctx.beginPath();
    ctx.arc(cannonX,cannonY,20,0,2*Math.PI);
    ctx.fill();

}

//=========================
// Mục tiêu
//=========================

function drawTarget(){

    // cọc

    ctx.strokeStyle="#555";
    ctx.lineWidth=3;

    ctx.beginPath();
    ctx.moveTo(targetX,cannonY);
    ctx.lineTo(targetX,cannonY-70);
    ctx.stroke();

    // vòng ngoài

    ctx.fillStyle="red";

    ctx.beginPath();
    ctx.arc(targetX,cannonY-85,18,0,2*Math.PI);
    ctx.fill();

    // vòng trắng

    ctx.fillStyle="white";

    ctx.beginPath();
    ctx.arc(targetX,cannonY-85,10,0,2*Math.PI);
    ctx.fill();

    // tâm

    ctx.fillStyle="red";

    ctx.beginPath();
    ctx.arc(targetX,cannonY-85,4,0,2*Math.PI);
    ctx.fill();

}


//=========================
// Đạn
//=========================

//=========================
// Cập nhật vị trí viên đạn
//=========================

function updateBullet() {

    if (!bullet) return;

    if (!bullet.flying) return;

    // Cập nhật vị trí đạn
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;

    // Gia tốc trọng trường
    bullet.vy += SIM_G;

    // Lưu quỹ đạo
    if(showTrace){
        traces.push({
            x: bullet.x,
            y: bullet.y
        });
    }

    //=========================================
    // KIỂM TRA TRÚNG BIA
    //=========================================

    const targetCenterY = cannonY - 85;
    const TARGET_RADIUS = 18;

    if (
        bullet.x >= targetX &&
        bullet.x - bullet.vx < targetX &&
        Math.abs(bullet.y - targetCenterY) <= TARGET_RADIUS
    ) {

        // Đạn dừng tại bia
        bullet.x = targetX;
        //bullet.y = targetCenterY;

        bullet.flying = false;

        message = "🎯 TRÚNG MỤC TIÊU!";

        return;
    }

    //=========================================
    // CHẠM ĐẤT
    //=========================================

    if (bullet.y >= cannonY) {

        bullet.y = cannonY;

        bullet.flying = false;

        checkResult();
    }

}
//=========================

function drawBullet() {

    if (!bullet) return;

    ctx.fillStyle = "orange";

    ctx.beginPath();

    ctx.arc(bullet.x, bullet.y, 7, 0, Math.PI * 2);

    ctx.fill();

}

//=========================

function checkResult(){

    // đổi từ pixel -> mét

    const landingDistance =

        (bullet.x - cannonX) / PIXEL_PER_METER;

    const error =

        landingDistance - problemDistance;

    if(Math.abs(error)<=3){

        message = "🎯 TRÚNG MỤC TIÊU";

    }
    else if(error<0){

        message =
            "Thiếu "
            + Math.round(-error)
            + " m";

    }
    else{

        message =
            "Quá "
            + Math.round(error)
            + " m";

    }

}
//=========================

function setMessage(text) {

  message = text;
}

//=========================

function draw(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // luôn cập nhật vị trí bia
    updateTargetPosition();

    drawGround();

    drawTarget();

    drawTrace();

    drawCannon();

    updateBullet();

    drawBullet();

    drawInfoPanel();

    drawMessage();

}


//=========================

function loop(){

    draw();

    requestAnimationFrame(loop);

}

loop();

//=========================

traceBtn.onclick=function(){

    showTrace=!showTrace;

    traceBtn.innerHTML=
        "Quỹ đạo : "
        +(showTrace?"ON":"OFF");

}

//=========================

randomBtn.onclick = function(){

    targetX = 500 + Math.random()*420;

    // Sinh khoảng cách của bài toán (không phụ thuộc pixel)
    problemDistance = Math.round((targetX - cannonX) / PIXEL_PER_METER);

}

//=========================


teacherBtn.onclick=function(){

    teacherMode=!teacherMode;

}

//=========================


function drawTrace(){

    if(!showTrace) return;

    if(traces.length<2) return;

    ctx.strokeStyle="#0066ff";
    ctx.lineWidth=2;

    ctx.beginPath();

    ctx.moveTo(
        traces[0].x,
        traces[0].y
    );

    for(let p of traces){

        ctx.lineTo(p.x,p.y);

    }

    ctx.stroke();

}

//=========================

//=========================
// Bảng thông số
//=========================

function drawInfoPanel(){

    ctx.save();

    // Nền
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(15,15,260,145);

    // Viền
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.strokeRect(15,15,180,145);

    // Tiêu đề
    ctx.fillStyle = "#003366";
    ctx.font = "bold 18px Arial";
    ctx.fillText("THÔNG SỐ",25,40);

    // Nội dung
    ctx.fillStyle = "#000";
    ctx.font = "17px Arial";

    ctx.fillText("v₀ = " + PROBLEM_V0 + " m/s",25,68);

    ctx.fillText("g = " + PROBLEM_G + " m/s²",25,93);

    ctx.fillText("L = " + Math.round(problemDistance) + " m",25,118);

    ctx.fillText("α = " + angle + "°",25,143);

    ctx.restore();

}

//====================================================
// HIỆN THÔNG ĐIỆP
//====================================================

function drawMessage(){

    if(message=="") return;

    ctx.save();

    ctx.font="bold 28px Arial";

    ctx.fillStyle="blue";

    ctx.textAlign="center";

    ctx.fillText(
        message,
        canvas.width/2,
        60
    );

    ctx.restore();

}
