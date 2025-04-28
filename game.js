const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const balloonLetters = 'abcdefghijklmnopqrstuvwxy'.split('');
const balloonImages = {};
let loadedImages = 0;
const totalImagesToLoad = balloonLetters.length + 3;
let allImagesLoaded = false;

const pump = new Image();
const pumpBox = new Image();
const pumpTap = new Image();

const balloons = [];
let currentBalloonIndex = 0;

function imageLoaded() {
    loadedImages++;
    if (loadedImages === totalImagesToLoad) {
        allImagesLoaded = true;
    }
}

balloonLetters.forEach(letter => {
    const img = new Image();
    img.src = `${letter}_Ballon.png`;
    img.onload = imageLoaded;
    balloonImages[letter] = img;
});

pump.src = 'pump.png';
pump.onload = imageLoaded;

pumpBox.src = 'pumpBox.png';
pumpBox.onload = imageLoaded;

pumpTap.src = 'pumpTap.png';
pumpTap.onload = imageLoaded;

class Balloon {
    constructor(image) {
        this.image = image;
        this.x = pumpX + 30;
        this.y = pumpY - 30;
        this.scale = 0.1;
        this.inflateClicks = 0;
        this.maxInflateClicks = 3;
        this.isFilled = false;

        this.vx = 0;
        this.vy = 0;
        this.speed = 1 + Math.random() * 1.5;
        this.waveOffset = Math.random() * 1000;
    }

    inflate() {
        if (this.inflateClicks < this.maxInflateClicks) {
            this.inflateClicks++;
            this.scale = 0.1 + (this.inflateClicks * 0.1);
            if (this.inflateClicks === this.maxInflateClicks) {
                this.isFilled = true;

                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed;
            }
        }
    }

    move() {
	    if (this.isFilled) {
		this.x += this.vx;
		this.y += this.vy;

		const width = this.image.width * this.scale;
		const height = this.image.height * this.scale;

		if (this.x - width/2 <= 0 || this.x + width/2 >= canvas.width) {
		    this.vx *= -1;
		}

		if (this.y - height/2 <= 0 || this.y + height/2 >= canvas.height) {
		    this.vy *= -1;
		}

		const time = Date.now() * 0.003;
		this.y += Math.sin(time + this.waveOffset) * 0.5;
	    }
	}

    draw() {
        const width = this.image.width * this.scale;
        const height = this.image.height * this.scale;
        ctx.drawImage(this.image, this.x - width/2, this.y - height/2, width, height);
    }

    isOutOfBounds() {
        return (this.x > canvas.width + 100 || this.x < -100 || this.y > canvas.height + 100 || this.y < -100);
    }

    isClicked(mouseX, mouseY) {
        const width = this.image.width * this.scale;
        const height = this.image.height * this.scale;
        return (
            mouseX >= this.x - width/2 &&
            mouseX <= this.x + width/2 &&
            mouseY >= this.y - height/2 &&
            mouseY <= this.y + height/2
        );
    }
}

const pumpX = canvas.width - 200;
const pumpY = canvas.height - 300;

canvas.addEventListener('click', (e) => {
    if (!allImagesLoaded) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = 0; i < balloons.length; i++) {
        if (balloons[i].isClicked(mouseX, mouseY)) {
            if (balloons[i].isFilled) {
                balloons.splice(i, 1);
                return;
            }
        }
    }

    const pumpWidth = pump.width * 0.4;
    const pumpHeight = pump.height * 0.4;
    if (mouseX >= pumpX && mouseX <= pumpX + pumpWidth &&
        mouseY >= pumpY && mouseY <= pumpY + pumpHeight) {
        inflateOrCreateBalloon();
    }
});
function inflateOrCreateBalloon() {
    let balloon = balloons.find(b => !b.isFilled);
    if (!balloon) {
        const newBalloon = new Balloon(balloonImages[balloonLetters[currentBalloonIndex]]);
        balloons.push(newBalloon);
        currentBalloonIndex = (currentBalloonIndex + 1) % balloonLetters.length;
        balloon = newBalloon;
    }
    balloon.inflate();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!allImagesLoaded) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.fillText('Loading...', canvas.width / 2 - 80, canvas.height / 2);
        requestAnimationFrame(gameLoop);
        return;
    }

    for (let i = balloons.length - 1; i >= 0; i--) {
        balloons[i].move();
        balloons[i].draw();
        if (balloons[i].isOutOfBounds()) {
            balloons.splice(i, 1);
        }
    }

    ctx.drawImage(pumpBox, pumpX, pumpY + 110, pumpBox.width * 0.5, pumpBox.height * 0.5);
    ctx.drawImage(pumpTap, pumpX - 150, pumpY + 80, pumpTap.width * 0.5, pumpTap.height * 0.5);
    ctx.drawImage(pump, pumpX, pumpY, pump.width * 0.4, pump.height * 0.4);

    requestAnimationFrame(gameLoop);
}

gameLoop();
