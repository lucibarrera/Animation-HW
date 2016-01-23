function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 3;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 0);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    var myImage = new Image(800, 400);
    myImage.src = "./img/gym.png";
    ctx.drawImage(myImage, 0, 0, 800, 400);
    Entity.prototype.draw.call(this);
}

function KarateCat(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/idle.png"), 0, 0, 64, 30, 0.1, 3, true, false);
    this.walkanimation = new Animation(ASSET_MANAGER.getAsset("./img/walk.png"), 0, 0, 64, 30, 0.1, 7, true, false);
    this.airkickanimation = new Animation(ASSET_MANAGER.getAsset("./img/airkick.png"), 0, 0, 64, 30, 0.1, 9, false, false);
    this.onetwoanimation = new Animation(ASSET_MANAGER.getAsset("./img/onetwo.png"), 0, 0, 64, 30, 0.1, 9, false, false);
    this.roundkickanimation = new Animation(ASSET_MANAGER.getAsset("./img/roundkick.png"), 0, 0, 64, 30, 0.1, 7, false, false);
    this.walking = true;
    this.kicking = false;
    this.kick = 0;
    this.x = 0;
    this.y = 0;
    this.finalX = 300;
    this.game = game;
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 290);
}

KarateCat.prototype = new Entity();
KarateCat.prototype.constructor = KarateCat;

KarateCat.prototype.update = function () {
    if (this.walking) {
        if (this.x === this.finalX) {//(this.walkanimation.isDone()) {
            this.walkanimation.elapsedTime = 0;
            this.walking = false;
        }  
        this.x += 1;
    }
    else {
        if (this.game.space) {
            this.kicking = true;
            this.kick = Math.floor(Math.random() * 3 + 1);
        }

        if (this.kicking) {
            console.log("Doing move #" + this.kick);
            switch (this.kick) {
            case 1: 
                if (this.airkickanimation.isDone()) {
                    this.airkickanimation.elapsedTime = 0;
                    this.kicking = false;
                    this.kick = 0;
                }    
                break;
            case 2: 
                if (this.onetwoanimation.isDone()) {
                    this.onetwoanimation.elapsedTime = 0;
                    this.kicking = false;
                    this.kick = 0;
                }    
                break;
            case 3: 
                if (this.roundkickanimation.isDone()) {
                    this.roundkickanimation.elapsedTime = 0;
                    this.kicking = false;
                    this.kick = 0;
                }    
                break;
            default: break;       
            }
        }
    }
    Entity.prototype.update.call(this);
}

KarateCat.prototype.draw = function (ctx) {
    if (this.walking) {
        this.walkanimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        switch (this.kick) {
            case 1: this.airkickanimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                break;
            case 2: this.onetwoanimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                break;
            case 3: this.roundkickanimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                break;
            default: this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);

        }
    }
    
    Entity.prototype.draw.call(this);
}

var ASSET_MANAGER = new AssetManager();


//Sprite Sheets and background image
ASSET_MANAGER.queueDownload("./img/idle.png");
ASSET_MANAGER.queueDownload("./img/walk.png");
ASSET_MANAGER.queueDownload("./img/airkick.png");
ASSET_MANAGER.queueDownload("./img/onetwo.png");
ASSET_MANAGER.queueDownload("./img/roundkick.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var gym = new Background(gameEngine);
    var cat = new KarateCat(gameEngine);

    gameEngine.addEntity(gym);
    gameEngine.addEntity(cat);
    
    gameEngine.init(ctx);
    gameEngine.start();
});