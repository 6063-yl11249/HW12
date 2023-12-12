// serial variables
let mSerial;

let connectButton;

let readyToReceive;

// project variables
let player;
let platforms = [];
let gravity = 0.5;
let jumpForce = -10;
let score = 0;
let left = false;
let right = false;
let platformBuffer = 140;

function receiveSerial() {
  let line = mSerial.readUntil("\n");
  trim(line);
  if (!line) return;

  if (line.charAt(0) != "{") {
    print("error: ", line);
    readyToReceive = true;
    return;
  }

  // get data from Serial string
  let data = JSON.parse(line).data;
  let d2 = data.D2;
  let d3 = data.D3;

  // use data to update project variables
  if (d2.isPressed) {
    player.velocity.x = -5;
  }

  if (d3.isPressed) {
    player.velocity.x = 5;
  }

  // serial update
  readyToReceive = true;
}

function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600);

    readyToReceive = true;
    connectButton.hide();
  }
}

function setup() {
  // setup project
  createCanvas(windowWidth, windowHeight);

  // Initialize player as a square sprite
  player = createSprite(width / 2, height - 50, 50, 50);

  // Create an initial platform for the player to stand on
  let initialPlat = createSprite(width / 2, height - 25, 100, 20);
  platforms.push(initialPlat);

  // Generate some platforms off the screen to start
  for (let i = 1; i < 5; i++) {
    let plat = createSprite(
      random(50, width - 50),
      height - i * platformBuffer,
      100,
      20
    );
    platforms.push(plat);
  }

  // setup serial
  readyToReceive = false;

  mSerial = createSerial();

  connectButton = createButton("Connect To Serial");
  connectButton.position(width / 2, height / 2);
  connectButton.mousePressed(connectToSerial);
}

function draw() {
  // project logic
  background("pink");

  // Apply gravity to player
  player.velocity.y += gravity;

  // Player movement
  if (left) {
    player.velocity.x = -5;
  } else if (right) {
    player.velocity.x = 5;
  } else {
    player.velocity.x = 0;
  }

  // Player jump
  for (let i = platforms.length - 1; i >= 0; i--) {
    let plat = platforms[i];
    if (player.collide(plat) && player.velocity.y > 0) {
      player.velocity.y = jumpForce;
    }
  }

  // When the player is above a third of the screen, move platforms down
  if (player.position.y < height / 3) {
    player.position.y = height / 3;
    for (let plat of platforms) {
      plat.position.y += abs(player.velocity.y);
    }

    // Increase score as player goes up
    score++;
  }

  // Remove off-screen platforms and add new ones
  for (let i = platforms.length - 1; i >= 0; i--) {
    if (platforms[i].position.y > height) {
      platforms[i].remove();
      platforms.splice(i, 1);
    }
  }

  // If there are less than 5 platforms, add a new one
  if (platforms.length < 5) {
    let newPlatY = platforms[platforms.length - 1].position.y - platformBuffer;
    let newPlat = createSprite(random(50, width - 50), newPlatY, 100, 20);
    platforms.push(newPlat);
  }

  // Check for game over
  if (player.position.y > height) {
    noLoop();
    alert("Game Over! Score: " + score);
  }

  // Draw all sprites
  drawSprites();

  // Display score
  fill(255);
  textAlign(CENTER);
  textSize(32);
  text(score, width / 2, 50);



  // update serial: request new data
  if (mSerial.opened() && readyToReceive) {
    readyToReceive = false;
    mSerial.clear();
    mSerial.write(0xab);
  }

  // update serial: read new data
  if (mSerial.availableBytes() > 8) {
    receiveSerial();
  }
}
