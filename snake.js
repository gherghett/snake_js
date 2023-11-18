/*Simple snake game entirely in javascript (and html)
the divsgeneration.py was used to generate the very many divs that represents the tiles, 
most of the code is in the Snake class, the gameloop is simple, the failstate is a reload of the screen
the snake doesnt change speed as apples are eaten
*/
const TILES_HORIZONTAL = 16;
const TILES_VERTICAL = 16;

function createDivs(){
    let body = document.body;
    let gridDiv = document.createElement("div");
    gridDiv.classList.add("grid");
    body.appendChild(gridDiv);
    for(let i = 0; i < TILES_VERTICAL; i++){
        for(let j = 0; j < TILES_HORIZONTAL; j++){
            let tile = document.createElement("div");
            tile.id = getTileId(i, j);
            tile.classList.add("tile");
            gridDiv.appendChild(tile);
        }
    }
}

//x is updown and y leftright
function getTileId(x, y){
    return x.toString().padStart(2, '0') + y.toString().padStart(2, '0');
}

function randomPos(){
    return Math.floor(Math.random()*16);//the number of tiles is hardcoded
}

class Snake {
    x;
    y;
    moveDir;
    snakeBody = [];
    tail;
    bodyLength;
    constructor(){
        this.x = 8;
        this.y = 8;
        this.moveDir = "ArrowRight";
        this.snakeBody.push([this.x, this.y]);
        this.tail = [this.x, this.y];
        this.bodyLength = 5; //change to "grow the snake"
    }


    changeDir(dir){
        this.moveDir = dir;
        //console.log("snakedir is"+this.moveDir);
    }

    move(){
        let x = this.x;
        let y = this.y;
        let moveDir = this.moveDir;

        if(moveDir === "ArrowRight")
            y++;
        else if(moveDir === "ArrowLeft")
            y--;
        else if(moveDir === "ArrowUp")
            x--;
        else if(moveDir === "ArrowDown")
            x++;

        if( y > 15 ) y = 0;
        if( x > 15 ) x = 0;
        if( y < 0 ) y = 15;
        if( x < 0 ) x = 15;
 
        let pos = [x, y];
        //console.log(pos)
        this.snakeBody.unshift(pos);
        if(this.snakeBody.length > this.bodyLength)
            this.tail = this.snakeBody.pop();

        this.x = x;
        this.y = y;
    }

    collide(apple) {
        if(this.x === apple.x && this.y === apple.y){
            this.bodyLength += 3;
            apple.regen(this);
            return true;
        }     
        this.snakeBody.slice(1).forEach(element => {
            if(element[0] === this.x && element[1] === this.y)
                window.location.reload();
        });
        return false;
    }

    checkPosFree(x, y){
        let collision = true;
        this.snakeBody.forEach(element => {
            if(element[0] === x && element[1] === y)
                collision = false;
        });
        return collision;
    }


    draw(){
        // console.log("tail"+this.tail)
        let tailEnd = document.getElementById(getTileId(...this.tail));
        tailEnd.classList.remove('snakeBody');
        //we need to draw the head and erase the tail
        let head = document.getElementById(getTileId(...this.snakeBody[0]));
        head.classList.add('snakeBody');
    }
}

class Apple {
    x;
    y;
    appleTile;
    //appleNew;
    constructor(){
        this.regen();
    }
    regen(snake=null){
        if( this.appleTile != undefined )
            this.dispose()
        this.x = randomPos();
        this.y = randomPos();
        let ccc = 1;
        if(snake == null || snake.checkPosFree(this.x, this.y)){
            this.appleTile = document.getElementById(getTileId(this.x, this.y));
            this.appleTile.classList.add('appleTile');
        } else {
            this.regen(snake);
        }
    }
    dispose(){
        this.appleTile.classList.remove("appleTile");
        //appleNew = true; //to see if an apple was eaten, to speed up snake (that is speed whole game up)
    }
}

class GameWorld {
    constructor(){
        this.snake = new Snake();
        this.apple = new Apple();
        this.gameSpeed = 150;
        this.intervalId = setInterval(() => this.gameLoop(), this.gameSpeed);
    }
    gameLoop(){
        this.snake.move();
        this.snake.draw();
        if( this.snake.collide(this.apple)){
            this.speedUp();
        }
        console.log("gm");
    }
    speedUp(){
        clearInterval(this.intervalId);
        this.gameSpeed = Math.floor(this.gameSpeed*0.95);
        this.intervalId = setInterval(() => this.gameLoop(), this.gameSpeed);
    }
}

createDivs();

const gameWorld = new GameWorld();

window.addEventListener('keydown', function(event) {
    console.log('Key pressed:', event.key);
    gameWorld.snake.changeDir(event.key);
});
