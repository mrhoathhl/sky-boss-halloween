class SceneEndCard extends Phaser.Scene {
    constructor() {
        super({ key: "SceneEndCard" });
    }

    create() {
        cameras = this.cameras.main;
        cameras.fadeIn(1000, 0, 0, 0);
        this.backgroundEndcard = new Assets(this, 0, 0, "sprBackgroundEndcard").setOrigin(0, 0);
        if (isWin) {
            this.playSound("completeSound");
            this.menuReward = new Assets(this, cameras.width / 2, cameras.height / 3, "sprWinBattle").setDepth(2);
            this.haloChest = new Assets(this, cameras.width / 2, cameras.height / 3 + this.menuReward.displayHeight / 2.4, "sprShipHalo").setDepth(2).setScale(1.3);
            this.chestReward = new Assets(this, this.haloChest.x, this.haloChest.y + 20, "sprChestReward").setDepth(2);
            this.nextLevelBtn = new Assets(this, cameras.width / 2, cameras.height / 3 + this.menuReward.displayHeight / 1.6, "sprNextLevelBtn").setDepth(2).setInteractive();
        } else if (isLose) {
            this.playSound("tryAgainSound");
            this.menuReward = new Assets(this, cameras.width / 2, cameras.height / 3, "sprFailBattle").setDepth(2);
            this.tryAgainBtn = new Assets(this, cameras.width / 2, cameras.height / 3 + this.menuReward.displayHeight / 1.6, "sprTryAgainBtn").setDepth(2).setInteractive();
        }
        // this.snow = new Assets(this, cameras.width / 2, cameras.height - 239, "sprSnow").setDepth(1);
        this.input.on("pointerdown", function () {
            !Sounds["bgSound"].playing() ? Sounds["bgSound"].play() : "";
            console.log("GOTOSTORE");
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


    playSound(name) {
        Sounds[name].currentTime = 0;
        Sounds[name].play();
    }

    update() {
        isWin ? (this.haloChest.angle += 2) : "";
    }
}