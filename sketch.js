// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let particles = [];

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  blendMode(BLEND);
  background('#e7c6ff');

  // 計算影像顯示的尺寸與位置 (全螢幕的 50%)
  let displayW = width * 0.5;
  let displayH = height * 0.5;
  let displayX = (width - displayW) / 2;
  let displayY = (height - displayH) / 2;

  // 畫出攝像頭影像
  image(video, displayX, displayY, displayW, displayH);

  // 在影像上方中間加上文字
  fill(0); // 設定文字顏色為黑色
  noStroke();
  textSize(24);
  textAlign(CENTER, BOTTOM);
  text("414730506 張怡婕", displayX + displayW / 2, displayY - 10);

  blendMode(ADD);
  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 定義手指關鍵點區段
        let fingerSegments = [
          [0, 1, 2, 3, 4],     // 大拇指
          [5, 6, 7, 8],        // 食指
          [9, 10, 11, 12],     // 中指
          [13, 14, 15, 16],    // 無名指
          [17, 18, 19, 20]     // 小指
        ];

        // 畫出手指連線
        stroke(0, 150, 255); // 亮藍色發光線條
        strokeWeight(3);
        for (let segment of fingerSegments) {
          for (let j = 0; j < segment.length - 1; j++) {
            let kp1 = hand.keypoints[segment[j]];
            let kp2 = hand.keypoints[segment[j + 1]];

            // 座標映射
            let x1 = map(kp1.x, 0, video.width, displayX, displayX + displayW);
            let y1 = map(kp1.y, 0, video.height, displayY, displayY + displayH);
            let x2 = map(kp2.x, 0, video.width, displayX, displayX + displayW);
            let y2 = map(kp2.y, 0, video.height, displayY, displayY + displayH);

            line(x1, y1, x2, y2);
          }
        }

        // 只在指尖（4, 8, 12, 16, 20）產生旺盛的火焰粒子
        let fingertips = [4, 8, 12, 16, 20];
        for (let i of fingertips) {
          let keypoint = hand.keypoints[i];
          
          let mappedX = map(keypoint.x, 0, video.width, displayX, displayX + displayW);
          let mappedY = map(keypoint.y, 0, video.height, displayY, displayY + displayH);

          // 增加產生數量（5個）以達到旺盛效果
          for (let n = 0; n < 5; n++) {
            particles.push(new Particle(mappedX, mappedY));
          }
        }
      }
    }
  }

  // 更新與顯示所有粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }
}

// 火焰粒子類別
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1.5, 1.5);
    this.vy = random(-7, -2); // 向上飄得更高更快，營造旺盛感
    this.alpha = 255;
    this.r = random(10, 25); // 粒子直徑加大
    
    // 使用指定的漸層色系：03045e-023e8a-0077b6-0096c7
    let palette = ["#03045e", "#023e8a", "#0077b6", "#0096c7"];
    let colHex = random(palette);
    this.col = color(colHex);
  }

  finished() {
    return this.alpha < 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 7; // 稍微減慢消失速度，讓火焰更長
    this.r -= 0.4;   // 逐漸變小
  }

  show() {
    noStroke();
    let c = this.col;
    fill(red(c), green(c), blue(c), this.alpha);
    circle(this.x, this.y, this.r);
  }
}
