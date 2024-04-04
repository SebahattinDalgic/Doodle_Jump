const config = {
	type: Phaser.AUTO,
	width: 620,
	height: window.innerHeight,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: true,
		},
	},
	scene: {
		preload: preload,
		create: create,
		update: update,
	},
}

window.addEventListener(
	'resize',
	function () {
		game.scale.resize(config.width, window.innerHeight)
	},
	false,
)

const game = new Phaser.Game(config)
let player
let platforms
let aKey
let dKey
let gameOverDistance = 0
let enemies
let gameOver = false
let spacebar
let ball
let score = 0
let scoreText

function preload() {
	this.load.image('background_img', 'assets/background.png')
	this.load.image('playerSprite', 'assets/player.png')
	this.load.image('playerJumpSprite', 'assets/player_jump.png')
	this.load.image('platform', 'assets/game-tiles.png')
	this.load.image('enemy', 'assets/enemy_default.png')
	this.load.spritesheet('enemyAnims', 'assets/enemy.png', { frameWidth: 161, frameHeight: 95 })
	this.load.image('ball', 'assets/ball.png')
	this.load.image('playerShoot', 'assets/player_up.png')
}

function create() {
	this.add.image(0, 0, 'background_img').setOrigin(0, 0).setScrollFactor(0)
	scoreText = this.add
		.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })
		.setScrollFactor(0)
		.setDepth(5)

	this.anims.create({
		key: 'jump',
		frames: [{ key: 'playerJumpSprite' }, { key: 'playerSprite' }],
		frameRate: 10,
		repeat: 0,
	})

	this.anims.create({
		key: 'shoot',
		frames: [{ key: 'playerShoot' }, { key: 'playerSprite' }],
		frameRate: 10,
		repeat: 0,
	})

	this.anims.create({
		key: 'enemy_fly',
		frames: 'enemyAnims',
		frameRate: 10,
		repeat: -1,
		yoyo: true,
	})

	createPlayer(this.physics)
	createPlatforms(this.physics)
	createEnemies(this.physics)
	createBall(this.physics)

	this.physics.add.collider(player, platforms, (playerObj, platformObj) => {
		if (platformObj.body.touching.up && playerObj.body.touching.down) {
			player.setVelocityY(-400)
			player.anims.play('jump', true)
		}
	})

	this.physics.add.collider(platforms, platforms, collider => {
		collider.x = Phaser.Math.Between(0, 640)
		collider.refreshBody()
	})

	this.physics.add.collider(player, enemies, (_, enemy) => {
		this.physics.pause()
		gameOver = true
		enemy.anims.stop()
	})

	this.physics.add.collider(platforms, enemies, collider => {
		collider.x = Phaser.Math.Between(0, 640)
		collider.refreshBody()
	})

	this.physics.add.collider(enemies, ball, (enemy, ball) => {
		enemy.disableBody(true, true)
		ball.disableBody(true, true)
		score += 100
		scoreText.setText('Score: ' + score)
	})

	this.cameras.main.startFollow(player, false, 0, 1)

	createKeys(this.input.keyboard)
}

function update() {
	if (gameOver) return
	checkMovement()
	checkBall()
	checkShoot()
	refactorePlatforms()
	refactoreEnemies()
	checkGameOver(this.physics)
	updateScore()
}

function createPlayer(physics) {
	player = physics.add.sprite(325, -100, 'playerSprite')
	player.setBounce(0, 1)
	player.setVelocityY(-400)
	player.body.setSize(64, 90)
	player.body.setOffset(32, 30)
	player.setDepth(10)
}

function createPlatforms(physics) {
	platforms = physics.add.staticGroup()
	platforms.create(325, 0, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -200, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -400, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -600, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -800, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -1000, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -1200, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -1400, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -1600, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -1800, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -2000, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -2200, 'platform')
	platforms.create(Phaser.Math.Between(0, 640), -2400, 'platform')
	platforms.children.iterate(function (platform) {
		platform.body.checkCollision.down = false
		platform.body.checkCollision.left = false
		platform.body.checkCollision.right = false
	})
}

function createEnemies(physics) {
	enemies = physics.add.group()
	enemies.create(Phaser.Math.Between(0, 640), Phaser.Math.Between(-950, -1300), 'enemy')
	enemies.children.iterate(function (enemy) {
		enemy.body.setSize(60, 60)
		enemy.body.setOffset(50, 10)
		enemy.body.setAllowGravity(false)
		enemy.anims.play('enemy_fly')
	})
}

function createBall(physics) {
	ball = physics.add.sprite(0, 0, 'ball')
	ball.active = false
	ball.body.setAllowGravity(false)
}

function createKeys(keyboard) {
	aKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, true, true)
	dKey = keyboard.addKey('D', true, true)
	spacebar = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
}

function checkMovement() {
	if (aKey.isDown && !dKey.isDown) {
		player.setVelocityX(-300)
		player.flipX = true
		if (player.x < 15) {
			player.x = 615
		}
	}
	if (dKey.isDown && !aKey.isDown) {
		player.setVelocityX(300)
		player.flipX = false
		if (player.x > 615) {
			player.x = 25
		}
	}
	if (!aKey.isDown && !dKey.isDown) {
		player.setVelocityX(0)
	}
}

function checkBall() {
	if (ball.active && ball.startPosition - ball.y > config.height) {
		ball.disableBody(true, true)
	}
}

function checkShoot() {
	if (spacebar.isDown && !ball.active) {
		ball.x = player.x
		ball.y = player.y - 45
		player.anims.play('shoot')
		ball.enableBody(true, ball.x, ball.y, true, true)
		ball.startPosition = ball.y
		ball.setVelocityY(-1000)
	}
}

function refactorePlatforms() {
	let minY = 0
	platforms.children.iterate(function (platform) {
		if (platform.y < minY) minY = platform.y
	})
	platforms.children.iterate(function (platform) {
		if (platform.y > player.y && player.body.center.distance(platform.body.center) > 700) {
			platform.x = Phaser.Math.Between(0, 640)
			platform.y = minY - 200
			platform.refreshBody()
		}
	})
}

function refactoreEnemies() {
	enemies.children.iterate(function (enemy) {
		if (enemy.y > player.y && player.body.center.distance(enemy.body.center) > 700) {
			enemy.x = Phaser.Math.Between(0, 640)
			enemy.y = enemy.y - Phaser.Math.Between(1600, 2000)
			enemy.enableBody(true, enemy.x, enemy.y, true, true)
		}
	})
}

function checkGameOver(physics) {
	if (player.body.y > gameOverDistance) {
		physics.pause()
		gameOver = true
	} else if (player.body.y * -1 - gameOverDistance * -1 > 700) {
		gameOverDistance = player.body.y + 700
	}
}

function updateScore() {
	if (player.y * -1 > score) {
		score += 10
		scoreText.setText('Score: ' + score)
	}
}
