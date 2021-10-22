var DEFAULT_WIDTH = 1080,
    DEFAULT_HEIGHT = DEFAULT_WIDTH * 1.8,
    MAX_HEIGHT = 3168,
    MAX_WIDTH = 1440,
    MIN_HEIGHT = 320;
    MIN_WITDH = 188;
var game;

var config = {
    type: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? Phaser.CANVAS: Phaser.AUTO,
    backgroundColor: "black",
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 },
        },
    },
    scale: {
        //scalemode
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        parent: "phaser-app",
        resolution: 1,
        width: DEFAULT_WIDTH,
        height:DEFAULT_HEIGHT,
        min: {
            width: MIN_WITDH,
            height: MIN_HEIGHT,
        },
        max: {
            width: MAX_WIDTH,
            height: MAX_HEIGHT,
        },
    },
    scene: [Preload, ScenePlayGame, SceneEndCard],
    pixelArt: true,
    roundPixels: true,
};

game = new Phaser.Game(config);