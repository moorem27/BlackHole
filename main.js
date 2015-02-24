
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.radius = 3;
    Entity.call(this, game, Math.random() * 1200, Math.random() * 800);
    this.velocity = { x: Math.random() * 1000, y: Math.random() *1000};
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

//Planet to be that other planets will orbit around
function Planet(game) {
    var canvas = document.getElementById('gameWorld');
    this.radius = 20;
    this.x = (canvas.width)/2;
    this.y = (canvas.height)/2;
    Entity.call(this, game, this.x, this.y);
}

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Planet.prototype = new Entity();
Planet.prototype.constructor = Planet;


Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    var planet = this.game.entities[0];
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;


    //Start at index 1, since index 0 is reserved for the planet
    for (var i = 1; i < this.game.entities.length; i++) {
        if(distance(planet, this.game.entities[i]) < this.game.entities[i].radius + planet.radius) {
            this.game.entities[i].removeFromWorld = true;
        }
        var ent = this.game.entities[i];
        var dist = distance(planet, ent);
        if (dist > planet.radius + ent.radius) {
            var difX = (ent.x - planet.x) / dist;
            var difY = (ent.y - planet.y) / dist;
            ent.velocity.x -= difX * gravity / (dist * dist);
            ent.velocity.y -= difY * gravity / (dist * dist);
            var speed = Math.sqrt(ent.velocity.x * ent.velocity.x + ent.velocity.y * ent.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    ent.velocity.x *= ratio;
                    ent.velocity.y *= ratio;
                }
        }

    }
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "Yellow";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

Planet.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "Blue";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI* 2, false);
    ctx.fill();
    ctx.closePath();
}

// the "main" code begins here
var gravity = 1000;
var maxSpeed = 200;
var ASSET_MANAGER = new AssetManager();
var planet;


ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    //var circle = new Circle(gameEngine);
    planet = new Planet(gameEngine);
    gameEngine.addEntity(planet);
    //gameEngine.addEntity(circle);

    for(var i = 0; i < 300; i++) {
        var circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }
    gameEngine.init(ctx);
    gameEngine.start();
});
