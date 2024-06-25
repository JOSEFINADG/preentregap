let dory;
let platforms = [];
let nemos = [];
let bgImage;
let doryImage;
let brickImage;
let nemoImage;
let gravity = 0.5;
let jumpForce = -10;
let isJumping = false;
let platformSpacing = 200; // Espaciado entre plataformas
let lastPlatformY = 100; // Altura de la última plataforma agregada
let score = 0; // Puntuación del jugador
let maxNemos = 30; // Número máximo de Nemos
let gameWon = false; // Indicador de si el juego se ha ganado
let nemosToWin = 20; // Número de Nemos necesarios para ganar
let idleTime = 0; // Tiempo sin acción del usuario
let maxIdleTime = 2 * 60; // 2 segundos en frames (asumiendo 60 frames por segundo)
let gameOver = false; // Indicador de si el juego se ha perdido

let cameraY = 0; // Posición de la cámara en Y
let cameraSpeed = 0.1; // Velocidad de seguimiento de la cámara

function preload() {
  bgImage = loadImage('fondo.png');
  doryImage = loadImage('dory.png');
  brickImage = loadImage('barra.png');
  nemoImage = loadImage('nemo.png');
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  resetGame();
}

function draw() {
  if (gameOver || gameWon) {
    background(bgImage);
    fill(255, 165, 0); // Color naranja
    textSize(64);
    textAlign(CENTER);
    text(gameWon ? '¡Ganaste!' : 'Game Over', width / 2, height / 2);
    textSize(32);
    text('Presiona Enter para reiniciar', width / 2, height / 2 + 60);
    return;
  }

  background(bgImage);

  // Desplazamiento suave de la cámara con un pequeño offset
  let targetCameraY = dory.y - height / 2 + 100; // Ajusta este valor para cambiar la altura de Dory en el canvas
  cameraY = lerp(cameraY, targetCameraY, cameraSpeed);

  dory.velocityY += gravity;
  dory.y += dory.velocityY;

  if (keyIsDown(UP_ARROW) && !isJumping) {
    dory.velocityY = jumpForce;
    isJumping = true;
    idleTime = 0;
  }

  let onPlatform = false;
  for (let platform of platforms) {
    if (dory.y + dory.height / 2 >= platform.y &&
        dory.y + dory.height / 2 <= platform.y + platform.height &&
        dory.x + dory.width / 2 > platform.x &&
        dory.x - dory.width / 2 < platform.x + platform.width &&
        dory.velocityY >= 0) {
      dory.velocityY = 0;
      dory.y = platform.y - dory.height / 2;
      onPlatform = true;
      isJumping = false;
      dory.y = platform.y - dory.height / 7 - 1;
    } else if (dory.y - dory.height / 2 <= platform.y + platform.height &&
               dory.y + dory.height / 2 >= platform.y + platform.height &&
               dory.x + dory.width / 2 > platform.x &&
               dory.x - dory.width / 2 < platform.x + platform.width) {
      dory.velocityY = 0;
      dory.y = platform.y + platform.height + dory.height / 2;
    }
  }

  if (!onPlatform) {
    dory.velocityY += gravity;
  }

  if (keyIsDown(LEFT_ARROW)) {
    dory.x -= 5;
    idleTime = 0;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    dory.x += 5;
    idleTime = 0;
  }
  if (keyIsDown(UP_ARROW)) {
    idleTime = 0;
  }

  idleTime++;
  if (idleTime >= maxIdleTime) {
    gameOver = true;
  }

  if (dory.x > width) {
    dory.x = 0;
  } else if (dory.x < 0) {
    dory.x = width;
  }

  if (dory.y > height) {
    dory.y = height - 100;
    dory.velocityY = 0;
    isJumping = false;
  }

  // Generar plataformas adicionales antes de que Dory llegue al punto de no haber más plataformas
  while (dory.y - 3 * platformSpacing < lastPlatformY) {
    let newPlatform = {
      x: random(width - 150), // Ajusta la posición x para que esté dentro del canvas
      y: lastPlatformY - platformSpacing,
      width: 150,
      height: 60,
      image: brickImage
    };
    platforms.push(newPlatform);
    lastPlatformY = newPlatform.y;

    // Agrega Nemos sobre algunas plataformas
    if (nemos.length < maxNemos && random() < 0.3) { // 30% de probabilidad de agregar un Nemo
      let nemo = {
        x: newPlatform.x + newPlatform.width / 2,
        y: newPlatform.y - 30,
        width: 30,
        height: 30,
        image: nemoImage,
        collected: false
      };
      nemos.push(nemo);
    }
  }

  // Ajustar la posición de dibujo para la cámara
  push();
  translate(0, -cameraY + height / 4);

  imageMode(CENTER);
  image(dory.image, dory.x, dory.y, dory.width, dory.height);

  for (let platform of platforms) {
    imageMode(CORNER);
    image(platform.image, platform.x, platform.y, platform.width, platform.height);
  }

  for (let nemo of nemos) {
    if (!nemo.collected) {
      imageMode(CENTER);
      image(nemo.image, nemo.x, nemo.y, nemo.width, nemo.height);
      if (dist(dory.x, dory.y, nemo.x, nemo.y) < dory.width / 2 + nemo.width / 2) {
        nemo.collected = true;
        score++;
      }
    }
  }

  pop();

  fill(255, 165, 0); // Color naranja
  textSize(32);
  text(`Score: ${score}/${nemosToWin}`, 10, 40);

  if (score >= nemosToWin) {
    fill(255, 165, 0); // Color naranja
    textSize(64);
    textAlign(CENTER);
    text('¡Ganaste!', width / 2, height / 2);
    gameWon = true;
    noLoop(); // Detiene el juego temporalmente
    textSize(32);
    text('Presiona Enter para reiniciar', width / 2, height / 2 + 60);
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW && !isJumping) {
    dory.velocityY = jumpForce;
    isJumping = true;
  }

  if ((gameWon || gameOver) && keyCode === ENTER) {
    resetGame();
    loop(); // Reinicia el bucle de dibujo
  }
}

function keyReleased() {
  if (keyCode === UP_ARROW) {
    isJumping = false;
  }
}

function resetGame() {
  dory = {
    x: width / 2,
    y: height / 2, // Ajusta la posición inicial de Dory más arriba en la pantalla
    width: 60,
    height: 60,
    velocityY: 0,
    image: doryImage
  };

  platforms = [];
  nemos = [];
  score = 0;
  gameWon = false;
  gameOver = false;
  idleTime = 0;
  cameraY = 0; // Reiniciar la posición de la cámara

  // Crear la plataforma inicial fija
  let initialPlatform = {
    x: width / 2 - 75, // Centra la plataforma inicial
    y: height - 100,
    width: 150,
    height: 60,
    image: brickImage
  };
  platforms.push(initialPlatform);
  lastPlatformY = initialPlatform.y;

  // Crea las primeras plataformas encima de la inicial
  for (let i = 1; i <= 5; i++) {
    let platform = {
      x: random(width - 150), // Ajusta la posición x para que esté dentro del canvas
      y: initialPlatform.y - i * platformSpacing,
      width: 150,
      height: 60,
      image: brickImage
    };
    platforms.push(platform);
    lastPlatformY = platform.y;

    // Agrega Nemos sobre algunas plataformas
    if (nemos.length < maxNemos && random() < 0.3) {
      let nemo = {
        x: platform.x + platform.width / 2,
        y: platform.y - 30,
        width: 30,
        height: 30,
        image: nemoImage,
        collected: false
      };
      nemos.push(nemo);
    }
  }
}
