class ScenePlayGame extends Phaser.Scene {
    constructor() {
        super({ key: "ScenePlayGame" });
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, "sprBackground").setOrigin(0, 0);

        this.shipHalo = new Assets(this, this.cameras.main.width / 2, this.cameras.main.height / 1.3, "sprShipHalo");

        this.player = new Player(this, this.cameras.main.width / 2, this.cameras.main.height / 1.3).setInteractive();

        playerMove = this.plugins.get("rexmovetoplugin").add(this.player, {
            speed: 700,
        });

        this.healthBarContainer = new Assets(this, 0, 0, "sprHealthBarContainer").setScale(2).setOrigin(0, 0).setDepth(4);
        this.playerHealthBar = this.makeBar(this.healthBarContainer.x + 139, this.healthBarContainer.y + 13, 0xffcd34, 280, 40).setDepth(4);
        this.setValue(this.playerHealthBar, 100);

        this.thrustle1 = new Thrustle(this, this.cameras.main.width / 2, this.cameras.main.height - 200);
        this.thrustle2 = new Thrustle(this, this.cameras.main.width / 2, this.cameras.main.height - 200);

        this.circleUpgrade = new Assets(this, this.cameras.main.width / 2, this.cameras.main.height - 200, "sprCircleUpgrade").setDepth(2);
        this.circleUpgrade.setVisible(false);

        this.warningBoss = new Assets(this, this.cameras.main.width / 2, this.cameras.main.height / 3, "sprWarningBoss").setScrollFactor(0).setAlpha(0).setScale(1.1);

        this.warningSequence = this.add
            .tileSprite(0, this.cameras.main.height / 5.5, this.cameras.main.width, 317, "sprWarningSequence")
            .setScrollFactor(0)
            .setOrigin(0, 0)
            .setDepth(2)
            .setScale(2)
            .setAlpha(0);

        this.tapToPlay = new Assets(this, this.cameras.main.width / 2, this.cameras.main.height / 2, "sprTapToPlay").setScrollFactor(0).setDataEnabled().setDepth(4);
        this.add.tween({
            targets: this.tapToPlay,
            ease: "Sine.easeInOut",
            duration: 400,
            delay: 0,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
            },
            repeat: -1,
            yoyo: true,
        });

        this.warningBossComing();
        this.bossShip();
        this.time.paused = true;

        this.enemiesBoss = this.add.group();
        this.enemiesProtector = this.add.group();
        this.protectorLasers = this.add.group();
        this.smallPresents = this.add.group();
        this.playerLasers = this.add.group();
        this.laserEnemy = this.add.group();
        this.upgradePoint = this.add.group();

        this.cameras.main.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

        this.physics.add.overlap(this.playerLasers, this.enemiesBoss, this.bossVsLaserP, null, this);
        this.physics.add.overlap(this.player, this.enemiesBoss, this.bossVsPlayer, null, this);

        this.physics.add.overlap(this.protectorLasers, this.player, this.bossVsLaserP, null, this);
        this.physics.add.overlap(this.playerLasers, this.enemiesProtector, this.bossVsLaserP, null, this);
        this.physics.add.overlap(this.player, this.enemiesProtector, this.bossVsPlayer, null, this);

        this.physics.add.overlap(this.player, this.upgradePoint, this.playerUpgrade, null, this);
        this.physics.add.overlap(this.player, this.smallPresents, this.collectSmallPresents, null, this);

        this.input.on("pointerdown", function () {
            !Sounds["bgSound"].playing() ? Sounds["bgSound"].play() : "";
            !isWin ? this.scene.player.setData("isShooting", true) : "";
            !isTween && !isWin && !isBossDead ? bossMove.resume() : "";
            this.scene.tapToPlay.setVisible(false);
            this.scene.tapToPlay.data.set("isPress", true);
            this.scene.time.paused = false;
        });

        this.input.on(
            "pointerup",
            function (pointer) {
                this.player.setData("isShooting", false);
                this.tapToPlay.data.set("isPress", false);
                this.time.paused = true;
                isBossAppeared ? bossMove.pause() : "";
            },
            this
        );

        this.input.setDraggable(this.player);
        this.input.dragDistanceThreshold = 0;
        this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
            if (!isWin) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }
        });

        this.sound.pauseOnBlur = false;
        this.game.events.on(Phaser.Core.Events.BLUR, () => {
            this.handleLoseFocus();
        });

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                return;
            }
            this.handleLoseFocus();
        });
    }

    handleLoseFocus() {
        if (this.scene.isActive("paused")) {
            return;
        }
        Sounds["bgSound"].pause();
        Sounds["playerFlySound"].pause();
        Sounds["completeSound"].pause();
        Sounds["tryAgainSound"].pause();
        Sounds["playerShootSound"].pause();
        Sounds["enhanceWeaponSound"].pause();
        Sounds["dieSound"].pause();

        this.scene.run("paused", {
            onResume: () => {
                this.scene.stop("paused");
                Sounds["bgSound"].resume();
                Sounds["playerFlySound"].resume();
                Sounds["completeSound"].resume();
                Sounds["tryAgainSound"].resume();
                Sounds["playerShootSound"].resume();
                Sounds["enhanceWeaponSound"].resume();
                Sounds["dieSound"].resume();
            },
        });
    }

    makeBar(x, y, color, width, height) {
        let bar = this.add.graphics();
        bar.fillStyle(color, 1);
        bar.fillRect(0, 0, width, height);
        bar.x = x;
        bar.y = y;
        return bar;
    }

    setValue(bar, percentage) {
        bar.scaleX = percentage / 100;
    }
    warningBossComing() {
        this.time.addEvent({
            delay: alertBossTime,
            callback: function () {
                var warningIn = this.add.tween({
                    targets: [this.warningBoss, this.warningSequence],
                    ease: "Sine.easeInOut",
                    duration: 500,
                    delay: 0,
                    alpha: {
                        getStart: () => 0,
                        getEnd: () => 1,
                    },
                    repeat: 0,
                    yoyo: false,
                    loop: false,
                });
                var warningOut = this.add.tween({
                    targets: [this.warningBoss, this.warningSequence],
                    ease: "Sine.easeInOut",
                    duration: 500,
                    delay: 2000,
                    alpha: {
                        getStart: () => 1,
                        getEnd: () => 0,
                    },
                    repeat: 0,
                    yoyo: false,
                    loop: false,
                });
            },
            yoyo: false,
            callbackScope: this,
            repeat: 0,
            loop: false,
        });
        this.upgradeWeapon();
    }

    upgradeWeapon() {
        this.time.addEvent({
            delay: alertBossTime + 2000,
            callback: function () {
                if (this.tapToPlay.data.get("isPress")) {
                    var x = Phaser.Math.Between(70, this.cameras.main.width - 70);
                    var upgradePoint = new UpgradeWeapon(this, x, -100);
                    this.upgradePoint.add(upgradePoint);
                }
            },
            callbackScope: this,
            loop: false,
        });
    }

    collectSmallPresents(player, smallPresent) {
        if (this.tapToPlay.data.get("isPress")) {
            if (!player.getData("isDead")) {
                smallPresent.setData("isDead", true);
                smallPresent.destroy();
            }
        }
    }

    bossShip() {
        this.time.addEvent({
            delay: bossShowing,
            callback: function () {
                isBossAppeared = true;
                if (this.tapToPlay.data.get("isPress")) {
                    this.player.setData("isShooting", true);
                    this.boss = new BossShip(this, this.cameras.main.width / 2, 0).setScale(2.4).setDepth(3);
                    this.bossHealthBar1 = this.makeBar(this.boss.x, this.boss.y, 0x6b6b6b, 500, 20);
                    this.setValue(this.bossHealthBar1, 100);
                    this.bossHealthBar = this.makeBar(this.boss.x, this.boss.y, 0xcc2e3a, 500, 20);
                    this.setValue(this.bossHealthBar, 100);

                    this.protector1 = new ProtectorBoss1(this, 0, 0);
                    this.protector1HealthBar1 = this.makeBar(this.protector1.x, this.protector1.y, 0x6b6b6b, 150, 15);
                    this.setValue(this.protector1HealthBar1, 100);
                    this.protector1HealthBar2 = this.makeBar(this.protector1.x, this.protector1.y, 0xcc2e3a, 150, 15);
                    this.setValue(this.protector1HealthBar2, 100);

                    this.protector2 = new ProtectorBoss2(this, this.cameras.main.width, 0);
                    this.protector2HealthBar1 = this.makeBar(this.protector2.x, this.protector2.y, 0x6b6b6b, 150, 15);
                    this.setValue(this.protector2HealthBar1, 100);
                    this.protector2HealthBar2 = this.makeBar(this.protector2.x, this.protector2.y, 0xcc2e3a, 150, 15);
                    this.setValue(this.protector2HealthBar2, 100);
                    bossMove = this.plugins.get("rexmovetoplugin").add(this.boss, {
                        speed: 200,
                    });
                    protector1Move = this.plugins.get("rexmovetoplugin").add(this.protector1, {
                        speed: 250,
                    });
                    protector2Move = this.plugins.get("rexmovetoplugin").add(this.protector2, {
                        speed: 250,
                    });
                    this.enemiesBoss.add(this.boss);
                    this.enemiesProtector.add(this.protector1);
                    this.enemiesProtector.add(this.protector2);
                    this.time.addEvent({
                        delay: 2000,
                        callback: function () {
                            if (!isWin) {
                                if (!isBossDead) {
                                    posX = Phaser.Math.Between(50, this.game.config.width - 50);
                                    posY = Phaser.Math.Between(70, this.game.config.height / 2);
                                    bossMove.moveTo(posX, posY);
                                }
                            }
                        },
                        callbackScope: this,
                        loop: true,
                        repeat: -1,
                    });
                    this.time.addEvent({
                        delay: 0,
                        callback: function () {
                            if (!isWin) {
                                if (!isPro1Dead) {
                                    protector1Move.moveTo(this.boss.x - 350, this.boss.y + 200);
                                }
                                if (!isPro2Dead) {
                                    protector2Move.moveTo(this.boss.x + 350, this.boss.y + 200);
                                }
                            }
                        },
                        callbackScope: this,
                        loop: true,
                        repeat: -1,
                    });
                }
            },
            callbackScope: this,
            loop: false,
        });
    }

    playerUpgrade(player, upgradePoint) {
        if (this.tapToPlay.data.get("isPress")) {
            if (!player.getData("isDead")) {
                this.playSound("enhanceWeaponSound");
                this.circleUpgrade.setVisible(true);
                this.time.addEvent({
                    delay: 3000,
                    callback: function () {
                        this.circleUpgrade.setVisible(false);
                    },
                    callbackScope: this,
                    loop: false,
                });
                player.setData("levelWeaponPlayer", "sprBulletPlayerEnhanced");
                upgradePoint.destroy();
            }
        }
    }

    bossVsLaserP(laser, enemy) {
        if (this.tapToPlay.data.get("isPress")) {
            var x = Phaser.Math.Between(enemy.x - 100, enemy.x + 100);
            var y = Phaser.Math.Between(enemy.y - 100, enemy.y + 100) + 100;
            new Explode(this, x, y, "sprImpact").setDepth(3);
            if (laser.texture.key === "sprBulletPlayer" || laser.texture.key === "sprBulletPlayerEnhanced") {
                enemy.onDamge(laser.getData("damgePlayer"));
            } else if (laser.texture.key === "sprBulletProtector") {
                enemy.onDamge(laser.getData("protectorDamage"));
            }
            laser.destroy();
        }
    }

    bossVsPlayer(player, boss) {
        if (this.tapToPlay.data.get("isPress")) {
            if (!player.getData("isDead") && !boss.getData("isDead")) {
                var explode = new Explode(this, player.x, player.y, "sprImpact");
                player.onDamge(boss.getData("impactDamage"));
            }
        }
    }

    playSound(name) {
        Sounds[name].currentTime = 0;
        Sounds[name].play();
    }

    update() {
        if (nLoaded >= nAssets) {
            if (isBossDead && isPro1Dead && isPro2Dead) {
                playerMove.moveTo(this.cameras.main.width / 2, this.cameras.main.height / 1.3);
                isPro1Dead = false;
                isWin = true;
                this.player.onSuccessful(this);
                this.tapToPlay.setVisible(true);
            }

            this.background.tilePositionY -= 4;
            if (this.warningSequence !== undefined) {
                this.warningSequence.tilePositionX -= 3;
            }
            if (isBossAppeared && !isBossDead) {
                if (!this.boss.getData("isDead")) {
                    this.boss.update();
                }
            }
            if (!this.player.getData("isDead")) {
                this.player.update();
            } else {
                this.thrustle1.setVisible(false);
                this.thrustle2.setVisible(false);
                this.shipHalo.setVisible(false);
                this.time.paused = false;
                // this.tapToPlay.setVisible(false);
                this.tapToPlay.data.set("isPress", false);
            }

            if (isWin) {
                bossMove.stop();
                this.time.paused = false;
                this.tapToPlay.data.set("isPress", false);
                this.tapToPlay.setVisible(true);
                this.shipHalo.setVisible(false);
            }
            for (var i = 0; i < this.protectorLasers.getChildren().length; i++) {
                var laser = this.protectorLasers.getChildren()[i];
                laser.update();
                if (
                    laser.x < -laser.displayWidth ||
                    laser.x > this.cameras.main.width + laser.displayWidth ||
                    laser.y < -laser.displayHeight * 4 ||
                    laser.y > this.game.config.height + laser.displayHeight
                ) {
                    if (laser) {
                        laser.destroy();
                    }
                }
            }

            for (var i = 0; i < this.playerLasers.getChildren().length; i++) {
                var laser = this.playerLasers.getChildren()[i];
                laser.update();
                if (
                    laser.x < -laser.displayWidth ||
                    laser.x > this.cameras.main.width + laser.displayWidth ||
                    laser.y < -laser.displayHeight * 4 ||
                    laser.y > this.game.config.height + laser.displayHeight
                ) {
                    if (laser) {
                        laser.destroy();
                    }
                }
            }

            for (var i = 0; i < this.smallPresents.getChildren().length; i++) {
                var smallPresent = this.smallPresents.getChildren()[i];
                smallPresent.update();
                if (
                    smallPresent.x < -smallPresent.displayWidth ||
                    smallPresent.x > this.cameras.main.width + smallPresent.displayWidth ||
                    smallPresent.y < -smallPresent.displayHeight * 4 ||
                    smallPresent.y > this.game.config.height + smallPresent.displayHeight
                ) {
                    if (smallPresent) {
                        smallPresent.destroy();
                    }
                }
            }

            for (var i = 0; i < this.upgradePoint.getChildren().length; i++) {
                var upgrade = this.upgradePoint.getChildren()[i];
                upgrade.update();
            }

            for (var i = 0; i < this.enemiesProtector.getChildren().length; i++) {
                var protector = this.enemiesProtector.getChildren()[i];
                protector.update();
            }
        }
    }
}
