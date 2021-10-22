var nAssets = 27;
var snd;
var nLoaded = 0;
var checkShowing = false;
var alertBossTime = 500;
var bossShowing = 4000;
var impactImg = new Image();
var beamBossImg = new Image();
var thrustleImg = new Image();
var sprBossImg = new Image();
var sprPlayerImg = new Image();
var bossExplosionImg = new Image();
var protectorBossImg = new Image();
var bgSound, completeSound, tryAgainSound, playerFlySound, playerShootSound, enhanceWeaponSound, dieSound;
var count = 0;
var isWin = false;
var isLose = false;
var isBossAppeared = false;
var Sounds;
var tweenBoss;
var isTween = true;
var posX, posY;
var bossMove, playerMove, protector1Move, protector2Move;
var bloodBoss = 200000;
var impactDamage = 1000;
var damageEnemy = 1000;
var damgePlayer = 1000;
var damgePlayerEnhanced = 2000;
var bloodPlayer = 100000;
var bloodProtector = bloodBoss / 5;
var protectorDamage = 1000;
var isPro1Dead = false,
    isBossDead = false,
    isPro2Dead = false;
var player, cameras;
class Preload extends Phaser.Scene {
    constructor() {
        super({ key: "Preload" });
    }
    preload() {
        this.load.plugin("rexmovetoplugin", "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexmovetoplugin.min.js", true);
    }

    createGameObjects() {
        this.anims.create({
            key: "sprPlayerMotion",
            frames: this.anims.generateFrameNumbers("sprPlayer", {
                start: 0,
                end: 0,
            }),
            frameRate: 0,
            repeat: -1,
        });
        this.anims.create({
            key: "sprPlayerTurnMotion",
            frames: this.anims.generateFrameNumbers("sprPlayer", {
                start: 0,
                end: 0,
            }),
            frameRate: 0,
            repeat: -1,
        });
        this.anims.create({
            key: "sprPlayerHittedMotion",
            frames: this.anims.generateFrameNumbers("sprPlayer", {
                start: 0,
                end: 0,
            }),
            frameRate: 0,
            repeat: 0,
        });
        this.anims.create({
            key: "sprBossMotion",
            frames: this.anims.generateFrameNumbers("sprBoss", {
                start: 0,
                end: 40,
            }),
            frameRate: 15,
            repeat: -1,
        });
        this.anims.create({
            key: "sprBossDeadMotion",
            frames: this.anims.generateFrameNumbers("sprBoss", {
                start: 37,
                end: 40,
            }),
            frameRate: 15,
            repeat: 6,
        });
        this.anims.create({
            key: "sprBossExplosionMotion",
            frames: this.anims.generateFrameNumbers("sprBossExplosion"),
            frameRate: 30,
            repeat: 0,
        });
        this.anims.create({
            key: "sprImpactMotion",
            frames: this.anims.generateFrameNumbers("sprImpact"),
            frameRate: 24,
            repeat: 0,
        });
        this.anims.create({
            key: "sprThrustleMotion",
            frames: this.anims.generateFrameNumbers("sprThrustle"),
            frameRate: 41,
            repeat: -1,
        });
        this.anims.create({
            key: "sprProtectorBossMotion",
            frames: this.anims.generateFrameNumbers("sprProtectorBoss"),
            frameRate: 15,
            repeat: -1,
        });
        this.cameras.main.fadeOut(0, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.start("ScenePlayGame");
        });
    }

    create() {
        this.textures.addBase64("sprBackground", sprBackgroundB64);
        nLoaded++;
        this.textures.addBase64("sprBackgroundEndcard", sprBackgroundEndcardB64);
        nLoaded++;
        this.textures.addBase64("sprWarningSequence", sprWarningSequenceB64);
        nLoaded++;
        this.textures.addBase64("sprWarningBoss", sprWarningBossB64);
        nLoaded++;
        this.textures.addBase64("sprBulletPlayer", sprBulletPlayerB64);
        nLoaded++;
        this.textures.addBase64("sprBulletPlayerEnhanced", sprBulletPlayerEnhancedB64);
        nLoaded++;
        this.textures.addBase64("sprBulletEnemy1", sprBulletEnemy1B64);
        nLoaded++;
        this.textures.addBase64("sprWinBattle", sprWinBattleB64);
        nLoaded++;
        this.textures.addBase64("sprFailBattle", sprFailBattleB64);
        nLoaded++;
        this.textures.addBase64("sprTapToPlay", sprTapToPlayB64);
        nLoaded++;
        this.textures.addBase64("sprTryAgainBtn", sprTryAgainBtnB64);
        nLoaded++;
        this.textures.addBase64("sprNextLevelBtn", sprNextLevelBtnB64);
        nLoaded++;
        this.textures.addBase64("sprChestReward", sprChestRewardB64);
        nLoaded++;
        this.textures.addBase64("sprCircleUpgrade", sprCircleUpgradeB64);
        nLoaded++;
        this.textures.addBase64("sprItemUpgrade", sprItemUpgradeB64);
        nLoaded++;
        this.textures.addBase64("sprBulletRearPlayer", sprBulletRearPlayerB64);
        nLoaded++;
        this.textures.addBase64("sprShipHalo", sprShipHaloB64);
        nLoaded++;
        this.textures.addBase64("sprHealthBarContainer", sprHealthBarContainerB64);
        nLoaded++;
        this.textures.addBase64("sprSmallPresents", sprSmallPresentsB64);
        nLoaded++;
        this.textures.addBase64("sprBulletProtector", sprBulletProtectorB64);
        nLoaded++;
        this.textures.addBase64("sprSnow", sprSnowB64);
        nLoaded++;
        Sounds = {
            bgSound: new Howl({
                src: backgroundSoundB64,
                loop: true,
                volume: 0.3
            }),
            completeSound: new Howl({
                src: completeSoundB64,
            }),
            tryAgainSound: new Howl({
                src: tryAgainSoundB64,
            }),
            playerFlySound: new Howl({
                src: playerFlySoundB64,
                volume: 1.6
            }),
            playerShootSound: new Howl({
                src: playerShootSoundB64,
                volume: 0.7
            }),
            enhanceWeaponSound: new Howl({
                src: enhanceWeaponSoundB64,
                volume: 1.5
            }),
            dieSound: new Howl({
                src: dieSoundB64,
                volume: 0.5
            }),
        };
        nLoaded++;

        sprPlayerImg.onload = () => {
            this.textures.addSpriteSheet("sprPlayer", sprPlayerImg, {
                frameWidth: 206,
                frameHeight: 153,
            });
            nLoaded++;
        };
        sprPlayerImg.src = sprPlayerB64;

        sprBossImg.onload = () => {
            this.textures.addSpriteSheet("sprBoss", sprBossImg, {
                frameWidth: 183,
                frameHeight: 238,
            });
            nLoaded++;
        };
        sprBossImg.src = sprBossB64;

        impactImg.onload = () => {
            this.textures.addSpriteSheet("sprImpact", impactImg, {
                frameWidth: 60,
                frameHeight: 60,
            });
            nLoaded++;
        };
        impactImg.src = sprImpactB64;

        bossExplosionImg.onload = () => {
            this.textures.addSpriteSheet("sprBossExplosion", bossExplosionImg, {
                frameWidth: 263,
                frameHeight: 263,
            });
            nLoaded++;
        };
        bossExplosionImg.src = sprBossExplosionB64;

        protectorBossImg.onload = () => {
            this.textures.addSpriteSheet("sprProtectorBoss", protectorBossImg, {
                frameWidth: 192,
                frameHeight: 264,
            });
            nLoaded++;
        };
        protectorBossImg.src = sprProtectorBossB64;

        thrustleImg.onload = () => {
            this.textures.addSpriteSheet("sprThrustle", thrustleImg, {
                frameWidth: 25,
                frameHeight: 79,
            });
            nLoaded++;
            if (nLoaded >= nAssets) {
                var actualCreate = this.createGameObjects.bind(this);
                actualCreate();
            }
        };
        thrustleImg.src = sprThrustleB64;
    }
}