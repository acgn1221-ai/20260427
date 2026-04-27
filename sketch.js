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
        stroke(255, 200); // 半透明白色線條
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

        // 遍歷所有關鍵點產生火焰粒子
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          
          // 將原始影像座標映射到畫布上顯示影像的區域
          let mappedX = map(keypoint.x, 0, video.width, displayX, displayX + displayW);
          let mappedY = map(keypoint.y, 0, video.height, displayY, displayY + displayH);

          // 每一幀在每個關鍵點產生 2 個粒子
          for (let n = 0; n < 2; n++) {
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
    this.vx = random(-1, 1);
    this.vy = random(-4, -1); // 向上飄
    this.alpha = 255;
    this.r = random(8, 20);
  }

  finished() {
    return this.alpha < 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 10; // 消失速度
    this.r -= 0.5;    // 逐漸變小
  }

  show() {
    noStroke();
    // 藍色火焰色調 (0, 100, 255) 到 (0, 255, 255)
    fill(0, random(100, 200), 255, this.alpha);
    circle(this.x, this.y, this.r);
  }
}
