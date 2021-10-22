class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, type) {
        super(scene, x, y, key);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0);
        this.setData("isDead", false);
    }
}
class UpgradeWeapon extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprItemUpgrade");
        this.body.velocity.y = 300;
    }

    update() {
        this.angle += 1;
        if (this.scene.tapToPlay.getData("isPress")) {
            this.body.velocity.y = 300;
        } else {
            this.body.velocity.y = 0;
        }
    }
}
class Player extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprPlayer");
        this.body.setSize(100, 100);
        this.setData("isBossDead", false);
        this.play("sprPlayerMotion");
        this.setData("bloodPlayer", bloodPlayer);
        this.setData("damgePlayer", damgePlayer);
        this.setData("levelWeaponPlayer", "sprBulletPlayer");
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 6);
        this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
    }

    update() {
        this.scene.circleUpgrade.x = this.x;
        this.scene.circleUpgrade.y = this.y;
        this.scene.circleUpgrade.angle += 5;
        this.scene.thrustle1.setAngle(0);
        this.scene.thrustle2.setAngle(0);
        this.scene.thrustle1.x = this.x - 48;
        this.scene.thrustle1.y = this.y + 50;
        this.scene.thrustle2.x = this.x + 48;
        this.scene.thrustle2.y = this.y + 50;
        this.scene.shipHalo.angle += 2;
        this.scene.shipHalo.x = this.x;
        this.scene.shipHalo.y = this.y;
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
        this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);
        if (this.scene.tapToPlay.getData("isPress") && this.getData("isShooting")) {
            if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
                this.setData("timerShootTick", this.getData("timerShootTick") + 1);
            } else {
                if (this.getData("levelWeaponPlayer") == "sprBulletPlayer") {
                    this.createBullet(this.scene, this.x, this.y, 29);
                } else if (this.getData("levelWeaponPlayer") == "sprBulletPlayerEnhanced") {
                    this.createBullet(this.scene, this.x, this.y, 34);
                }
                this.scene.playSound("playerShootSound");

                this.setData("timerShootTick", 0);
            }
        }
        if (this.body.y <= 0 && isWin) {
            this.scene.player.setVisible(false);
            this.scene.thrustle1.setVisible(false);
            this.scene.thrustle2.setVisible(false);
        }
    }

    onDead() {
        if (!this.getData("isDead")) {
            var explode = new Explode(this.scene, this.x + 130, this.y + 60, "sprBossExplosion").setScale(1).setDepth(3);
            explode.on("animationcomplete", function () {
                isLose = true;
                this.scene.player.onFailure();
            });
            this.setData("isDead", true);
        }
    }

    onDamge(damge) {
        this.setData("bloodPlayer", this.getData("bloodPlayer") - damge);
        if (this.getData("bloodPlayer") <= 0) {
            this.scene.player.setVisible(false);
            this.scene.playSound("dieSound");
            this.onDead();
        } else {
            this.scene.setValue(this.scene.playerHealthBar, (this.getData("bloodPlayer") / bloodPlayer) * 100);
        }
    }

    onFailure() {
        this.scene.time.addEvent({
            delay: 700,
            callback: function () {
                this.scene.cameras.main.fadeOut(500, 0, 0, 0);
                this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    this.scene.scene.start("SceneEndCard");
                });
            },
            callbackScope: this,
            loop: false,
        });
    }

    onSuccessful() {
        this.removeInteractive();
        this.setData("isShooting", false);
        this.scene.playSound("playerFlySound");
        this.scene.time.addEvent({
            delay: 1000,
            callback: function () {
                this.scene.player.body.velocity.y = -1500;
            },
            callbackScope: this,
            loop: false,
        });
        this.scene.time.addEvent({
            delay: 2000,
            callback: function () {
                this.scene.cameras.main.fadeOut(500, 0, 0, 0);
                this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    this.scene.scene.start("SceneEndCard");
                });
            },
            callbackScope: this,
            loop: false,
        });
        this.scene.playerLasers.clear(true, true);
        this.scene.smallPresents.clear(true, true);
    }

    createBullet(scene, x, y, stepBullet) {
        for (var bulletIndex = 0; bulletIndex < 5; bulletIndex++) {
            var laser;
            switch (bulletIndex) {
                case 0:
                    if (this.getData("levelWeaponPlayer") === "sprBulletPlayerEnhanced") {
                        laser = new PlayerWeapon(scene, x + bulletIndex * stepBullet - 55, y - 45, "sprBulletRearPlayer").setDepth(2).setAngle(-2);
                        this.scene.physics.velocityFromRotation(1.5, -1000, laser.body.velocity);
                        laser.body.velocity.x *= 2;
                        laser.body.velocity.y *= 2;
                    }
                    break;
                case 1:
                    if (this.getData("levelWeaponPlayer") === "sprBulletPlayerEnhanced") {
                        laser = new PlayerWeapon(scene, x + bulletIndex * stepBullet, y + 17, this.getData("levelWeaponPlayer"));
                    } else {
                        laser = new PlayerWeapon(scene, x + bulletIndex * stepBullet, y, this.getData("levelWeaponPlayer"));
                    }
                    laser.setDepth(2);
                    break;
                case 2:
                    if (this.getData("levelWeaponPlayer") === "sprBulletPlayerEnhanced") {
                        laser = new PlayerWeapon(scene, x + bulletIndex * stepBullet, y - 50, this.getData("levelWeaponPlayer"));
                    } else {
                        laser = new PlayerWeapon(scene, x + bulletIndex * stepBullet, y - 50, this.getData("levelWeaponPlayer"));
                    }
                    laser.setDepth(2);
                    break;
                case 3:
                    if (this.getData("levelWeaponPlayer") === "sprBulletPlayerEnhanced") {
                        laser = new PlayerWeapon(scene, x + bulletIndex * stepBullet, y + 17, this.getData("levelWeaponPlayer"));
                    } else {
                        laser = new PlayerWeapon(scene, x + bulletIndex * stepBullet, y, this.getData("levelWeaponPlayer"));
                    }
                    laser.setDepth(2);
                    break;
                case 4:
                    if (this.getData("levelWeaponPlayer") === "sprBulletPlayerEnhanced") {
                        laser = new PlayerWeapon(scene, x + bulletIndex * stepBullet - 80, y - 45, "sprBulletRearPlayer").setAngle(2).setDepth(2);
                        this.scene.physics.velocityFromRotation(-1.5, 1000, laser.body.velocity);
                        laser.body.velocity.x *= 2;
                        laser.body.velocity.y *= 2;
                    }
                    break;
            }
            if (laser !== undefined) {
                this.scene.playerLasers.add(laser);
            }
        }
    }
}

class PlayerWeapon extends Entity {
    constructor(scene, x, y, level) {
        super(scene, x, y, level);
        if (level === "sprBulletPlayer") {
            this.x = x - 61.5;
            this.y = y - 120;
            this.setData("damgePlayer", damgePlayer);
            this.body.velocity.y = -2000;
            this.body.setSize(18, 90);
        } else if (level === "sprBulletPlayerEnhanced") {
            this.x = x - 70;
            this.y = y - 120;
            this.setData("damgePlayer", damgePlayerEnhanced);
            this.body.setSize(30, 90, true);
            this.body.velocity.y = -2800;
        } else if (level === "sprBulletRearPlayer") {
            this.setData("damgePlayer", damgePlayer);
            this.body.setSize(18, 18, true);
        }
    }
}

class BossShip extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprBoss");
        this.play("sprBossMotion");
        this.setData("bloodBoss", bloodBoss);
        this.setData("impactDamage", impactDamage);
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 8);
        this.setData("timerShootTick", 0);
        this.body.velocity.y = 100;
        this.body.setCircle(60, 60, true).setOffset(35, 110);
    }

    update() {
        this.scene.bossHealthBar.x = this.x - this.displayWidth / 1.8;
        this.scene.bossHealthBar.y = this.y + this.displayHeight / 1.8;
        this.scene.bossHealthBar1.x = this.x - this.displayWidth / 1.8;
        this.scene.bossHealthBar1.y = this.y + this.displayHeight / 1.8;

        if (!isWin) {
            if (this.body.y <= 300) {
                if (this.scene.tapToPlay.getData("isPress")) {
                    this.body.velocity.y = 100;
                } else {
                    this.body.velocity.y = 0;
                }
            } else {
                isTween = false;
                this.body.velocity.y = 0;
            }
        }
    }

    onDamge(damge) {
        this.setData("bloodBoss", this.getData("bloodBoss") - damge);
        if (this.getData("bloodBoss") <= 0) {
            this.scene.bossHealthBar.setVisible(false);
            this.scene.bossHealthBar1.setVisible(false);
            this.scene.playSound("dieSound");
            this.play("sprBossDeadMotion");
            this.on("animationcomplete", function () {
                bossMove.stop();
                this.body.setVelocity(0, 0);
                this.onDead();
            });
        } else {
            this.scene.setValue(this.scene.bossHealthBar, (this.getData("bloodBoss") / bloodBoss) * 100);
            this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
            this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);
            if (this.scene.tapToPlay.getData("isPress")) {
                if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
                    this.setData("timerShootTick", this.getData("timerShootTick") + 1);
                } else {
                    this.posX = Phaser.Math.Between(this.x - 60, this.x + 60);
                    this.timeDelay = Phaser.Math.Between(0, 3);
                    this.smallPresent = new Assets(this.scene, this.posX, this.y + 130, "sprSmallPresents").setScale(1.7);
                    this.scene.smallPresents.add(this.smallPresent);
                    this.setData("timerShootTick", this.timeDelay);
                }
            }
        }
    }

    onDead() {
        if (!this.getData("isDead")) {
            this.setAngle(0);
            var explode = new Explode(this.scene, this.scene.boss.body.x + 130, this.scene.boss.body.y + 60, "sprBossExplosion").setScale(3.5).setDepth(3);
            isBossDead = true;
            this.setData("isDead", true);
            this.scene.add.tween({
                targets: this.scene.boss,
                ease: "Sine.easyInOut",
                duration: 1500,
                delay: 0,
                alpha: {
                    getStart: () => 1,
                    getEnd: () => 0,
                },
                repeat: 0,
                onComplete: () => {
                    this.destroy();
                },
            });
        }
    }
}

class ProtectorBoss1 extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprProtectorBoss");
        this.play("sprProtectorBossMotion");
        this.setData("bloodProtector", bloodProtector);
        this.setData("impactDamage", impactDamage);
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 100);
        this.setData("timerShootTick", 0);

        this.setData("timerShootDelay1", 5);
        this.setData("timerShootTick1", 0);
        this.body.setCircle(60, 60, true).setOffset(35, 35);
    }

    update() {
        this.scene.protector1HealthBar1.x = this.x - this.displayWidth / 2.5;
        this.scene.protector1HealthBar1.y = this.y + this.displayHeight / 1.5;
        this.scene.protector1HealthBar2.x = this.x - this.displayWidth / 2.5;
        this.scene.protector1HealthBar2.y = this.y + this.displayHeight / 1.5;

        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
        this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);
        if (this.scene.tapToPlay.getData("isPress")) {
            if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
                this.setData("timerShootTick", this.getData("timerShootTick") + 1);
            } else {
                if (this.getData("timerShootTick1") < this.getData("timerShootDelay1")) {
                    this.setData("timerShootTick1", this.getData("timerShootTick1") + 1);
                } else {
                    for (var i = 0; i < 2; i++) {
                        var angle;
                        i === 0 ? (angle = -10.7) : (angle = -11.4);
                        this.createBullet(this.scene, this.x, this.y, angle);
                    }
                    this.setData("timerShootTick1", 0);
                }
                this.scene.time.addEvent({
                    delay: 500,
                    callback: function () {
                        this.setData("timerShootTick", 0);
                    },
                    callbackScope: this,
                    loop: false,
                });
            }
        }
    }

    createBullet(scene, x, y, angle) {
        this.protectorLaser = new EnemyWeapon(scene, x, y + 130, "sprBulletProtector").setScale(1.7);
        this.scene.physics.velocityFromRotation(angle, 600, this.protectorLaser.body.velocity);
        this.protectorLaser.body.velocity.x *= 2;
        this.protectorLaser.body.velocity.y *= 2;
        this.scene.protectorLasers.add(this.protectorLaser);
    }
    onDamge(damge) {
        this.setData("bloodProtector", this.getData("bloodProtector") - damge);
        if (this.getData("bloodProtector") <= 0) {
            this.scene.protector1HealthBar1.setVisible(false);
            this.scene.protector1HealthBar2.setVisible(false);
            this.scene.playSound("dieSound");
            protector1Move.stop();
            protector1Move.setEnable(false);
            this.onDead();
        } else {
            this.scene.setValue(this.scene.protector1HealthBar2, (this.getData("bloodProtector") / bloodProtector) * 100);
        }
    }

    onDead() {
        if (!this.getData("isDead")) {
            var explode = new Explode(this.scene, this.x, this.y + 60, "sprBossExplosion").setScale(0.5).setDepth(3);
            this.setData("isDead", true);
            isPro1Dead = true;
            if (this.getData("isDead")) {
                if (this.onDestroy !== undefined) {
                    this.onDestroy();
                }
                this.destroy();
            }
        }
    }
}

class ProtectorBoss2 extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprProtectorBoss");
        this.play("sprProtectorBossMotion");
        this.setData("bloodProtector", bloodProtector);
        this.setData("impactDamage", impactDamage);
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 15);
        this.setData("timerShootTick", 0);

        this.setData("timerShootDelay1", 5);
        this.setData("timerShootTick1", 0);
        this.body.setCircle(60, 60, true).setOffset(35, 35);
    }

    update() {
        this.scene.protector2HealthBar1.x = this.x - this.displayWidth / 2.5;
        this.scene.protector2HealthBar1.y = this.y + this.displayHeight / 1.5;
        this.scene.protector2HealthBar2.x = this.x - this.displayWidth / 2.5;
        this.scene.protector2HealthBar2.y = this.y + this.displayHeight / 1.5;
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
        this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);
        if (this.scene.tapToPlay.getData("isPress")) {
            if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
                this.setData("timerShootTick", this.getData("timerShootTick") + 1);
            } else {
                if (this.getData("timerShootTick1") < this.getData("timerShootDelay1")) {
                    this.setData("timerShootTick1", this.getData("timerShootTick1") + 1);
                } else {
                    for (var i = 0; i < 2; i++) {
                        var angle;
                        i === 0 ? (angle = -10.7) : (angle = -11.4);
                        this.createBullet(this.scene, this.x, this.y, angle);
                    }
                    this.setData("timerShootTick1", 0);
                }
                this.scene.time.addEvent({
                    delay: 500,
                    callback: function () {
                        this.setData("timerShootTick", 0);
                    },
                    callbackScope: this,
                    loop: false,
                });
            }
        }
    }

    createBullet(scene, x, y, angle) {
        this.protectorLaser = new EnemyWeapon(scene, x, y + 130, "sprBulletProtector").setScale(1.7);
        this.scene.physics.velocityFromRotation(angle, 600, this.protectorLaser.body.velocity);
        this.protectorLaser.body.velocity.x *= 2;
        this.protectorLaser.body.velocity.y *= 2;
        this.scene.protectorLasers.add(this.protectorLaser);
    }

    onDamge(damge) {
        this.setData("bloodProtector", this.getData("bloodProtector") - damge);
        if (this.getData("bloodProtector") <= 0) {
            this.scene.protector2HealthBar1.setVisible(false);
            this.scene.protector2HealthBar2.setVisible(false);
            this.scene.playSound("dieSound");
            protector2Move.stop();
            protector2Move.setEnable(false);
            this.onDead();
        } else {
            this.scene.setValue(this.scene.protector2HealthBar2, (this.getData("bloodProtector") / bloodProtector) * 100);
        }
    }

    onDead() {
        if (!this.getData("isDead")) {
            var explode = new Explode(this.scene, this.x, this.y + 60, "sprBossExplosion").setScale(0.5).setDepth(3);
            this.setData("isDead", true);
            isPro2Dead = true;
            if (this.getData("isDead")) {
                if (this.onDestroy !== undefined) {
                    this.onDestroy();
                }
                this.destroy();
            }
        }
    }
}

class EnemyWeapon extends Entity {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        this.body.velocity.y = 1000;
        this.setData("protectorDamage", protectorDamage);
    }
}

class Explode extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        this.setScale(2.5);
        this.play(sprite + "Motion");
    }
}

class Thrustle extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "sprThrustle");
        scene.add.existing(this);
        this.play("sprThrustleMotion");
    }
}

class Assets extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        if (sprite === "sprSmallPresents") {
            this.setData("isDead", false);
            this.scene.physics.world.enableBody(this, 0);
            // this.body.setGravityY(1200);
            this.states = {
                MOVE_DOWN: "MOVE_DOWN",
                CHASE: "CHASE",
            };
            this.state = this.states.MOVE_DOWN;
        }
    }

    update() {
        if (this.scene.tapToPlay.getData("isPress") || isWin) {
            this.body.velocity.y = 500;
        } else {
            this.body.velocity.y = 0;
        }
        if (!this.getData("isDead")) {
            if (Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y) < 400) {
                this.state = this.states.CHASE;
            }

            if (this.state == this.states.CHASE && this.scene.tapToPlay.getData("isPress")) {
                var dx = this.scene.player.x - this.x;
                var dy = this.scene.player.y - this.y;

                var angle = Math.atan2(dy, dx);

                var speed = 700;
                this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            }
        }
    }
}
