/*
Game Engine code borrowed from Dr. Chris Mariott
 */

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.radius = 5;
    //this.prevX = 0;
    //this.prevY = 0;
    this.prevDist = distance(this, Planet);
    Entity.call(this, game, Math.random() * 1000, Math.random() * 1000);
    this.velocity = { x:  1000* Math.random() , y: 1000* Math.random()};
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
}

//Planet to be that other planets will orbit around
function Planet(game) {
    var canvas = document.getElementById('gameWorld');
    this.radius = 10;
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
        var currDist = distance(planet, this.game.entities[i]); //Current circle's distance from black hole

        //If the current distance is less than the previous distance, decrease circle radius
        if((currDist < this.game.entities[i].prevDist) && (this.game.entities[i].radius > 0) && currDist < 150) {
            this.game.entities[i].radius = this.game.entities[i].radius - .25;
        }

        this.game.entities[i].prevDist = distance(planet, this.game.entities[i]);

        //If circle passes event horizon, remove from simulation
        if(distance(planet, this.game.entities[i]) < this.game.entities[i].radius + planet.radius) {
            this.game.entities[i].removeFromWorld = true;
        }

        var ent = this.game.entities[i];
        var dist = distance(planet, ent); //straight line distance between the entity and the black hole


        if (dist > planet.radius + ent.radius) {
            var difX = (ent.x - planet.x) / dist;
            var difY = (ent.y - planet.y) / dist;

            //incorporate the black hole's gravitational pull
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
    ctx.fillStyle = "White";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

Planet.prototype.draw = function (ctx) {
    var background = new Image();
    background.src = "img/blackHole.jpg";
    ctx.drawImage(background, 0, 0);
    ctx.beginPath();
    ctx.fillStyle = "Black";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI* 2, false);
    ctx.fill();
    ctx.closePath();
}
var gameEngine;
var gravity = 1000;
var maxSpeed = 200;
var ASSET_MANAGER = new AssetManager();
var planet;


ASSET_MANAGER.queueDownload("./img/blackHole.jpg");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    gameEngine = new GameEngine();
    planet = new Planet(gameEngine);
    gameEngine.addEntity(planet);
    canvas.width = 1200;
    canvas.height = 800;
    for(var i = 0; i < 500; i++) {
        var circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }

    gameEngine.init(ctx);
    gameEngine.start();
});

$('document').ready(function() {
    var ipAddress = '76.28.150.193';
    var port = '8888';
    var socket = io.connect('http://' + ipAddress + ':' + port);
    socket.on("connect", function () {
        $('#saveState').submit(function(event){
            var saveName = $('#saveState').serializeArray()[0].value;
            event.preventDefault();
            var gameState = [];
            var star;
            for(var i = 1; i < gameEngine.entities.length; i++) {
                star = {x: gameEngine.entities[i].x, y: gameEngine.entities[i].y,
                    velocityX: gameEngine.entities[i].velocity.x, velocityY: gameEngine.entities[i].velocity.y};
                gameState.push(star);
            }
            socket.emit('save', {studentname: "Matthew Moore", statename: saveName, data: gameState});
        });

        $('#loadState').submit(function(event) {
            event.preventDefault();
            var loadName = $('#loadState').serializeArray()[0].value;
            socket.emit('load', {studentname: "Matthew Moore", statename: loadName});
            socket.on('load', function (d) {
                gameEngine.entities = [];
                planet = new Planet(gameEngine);
                gameEngine.addEntity(planet);
                for(var i = 0; i < d.data.length; i++) {
                    var c = new Circle(gameEngine);
                    c.x = d.data[i].x;
                    c.y = d.data[i].y;
                    c.velocity.x = d.data[i].velocityX;
                    c.velocity.y = d.data[i].velocityY;
                    gameEngine.addEntity(c);
                }
            });
        });

    });
});
