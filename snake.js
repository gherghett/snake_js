/*LESS Simple snake game entirely in javascript (and html)
regular snake rules, wrapping, collision, eat apple to grow and speed up
the html is generated by the javascript and is suppose to change as the game progresses
most of the code is in the Snake class, the gameloop is simple, the failstate is a reload of the screen
-this branch is uselessly 😬 complicating things by making visual effects, such as making the play-grid 
continue right and left, maybe itll spin aswell
*/
const TILES_HORIZONTAL = 16;
const TILES_VERTICAL = 16;
const TILE_SIZE = 20;
const GRID_SIZE = (20*16) + ((TILES_HORIZONTAL-1)*3); //365

const GROWTH_PER_APPLE = 3;
const START_SPEED = 150; //ms per frame, so lower value is higher speed
const SPEED_ACC = 0.95;

//x is updown and y leftright
function getTileClass(x, y){
    return "tile_" + x.toString().padStart(2, '0') + y.toString().padStart(2, '0');
}

function randomPos(){
    return Math.floor(Math.random()*TILES_HORIZONTAL);
}

class Grid {

    constructor(){
        this.height = 1;
        this.width = 1;
        this.posX = 0;
        this.posY = 0;

        this.window_height = window.innerHeight;
        this.window_width = window.innerWidth;
        this.maxColumns = Math.ceil(this.window_width/GRID_SIZE);
        this.maxRows = Math.ceil(this.window_height/GRID_SIZE);
        console.log("maxRows: "+this.maxRows +"maxColumns: "+this.maxColumns)

        this.moveState = 0;
        this.moveUp = false;
        this.moveLeft = false;
        this.moveInterval = null;

        this.body = document.body;
        this.metaGrid = document.createElement("div");
        this.metaGrid.id = "meta_grid";
        this.body.appendChild(this.metaGrid);
        this.gridDiv = document.createElement("div");
        this.createDivs();
    }

    createDivs(){
        this.gridDiv.id = "grid_original";
        this.gridDiv.classList.add("grid");
        this.metaGrid.appendChild(this.gridDiv);
        for(let i = 0; i < TILES_VERTICAL; i++){
            for(let j = 0; j < TILES_HORIZONTAL; j++){
                let tile = document.createElement("div");
                tile.classList.add(getTileClass(i, j));
                tile.classList.add("tile");
                this.gridDiv.appendChild(tile);
            }
        }
    }
    
    grow(){
        const addPlayGrid = (amount) => {
            for( let i = 0; i < amount; i++)
                this.metaGrid.appendChild(this.gridDiv.cloneNode(true));
        }
        const addWidth = (columns) => {
            this.width += columns;
            this.metaGrid.style.gridTemplateColumns = "repeat("+this.width+","+GRID_SIZE+"px)";
            addPlayGrid(this.height*columns);
        }
        if(this.height < this.maxRows){
            if(this.height == this.maxRows - 1){
                this.height = this.maxRows+1;
                addPlayGrid(2);
            } else {
                this.height += 1;
                addPlayGrid(1);
            }
        } else if(this.width < this.maxColumns){
            if(this.width == this.maxColumns - 1){
                addWidth(2);
            } else {
                addWidth(1);
            }
        } else if(this.width >= this.maxColumns && this.height >= this.maxRows){
            this.changeMoveState();
        }
        console.log("H: "+this.height+" W: "+this.width);
    }

    startMove(){
        this.moveInterval = setInterval(()=>this.move(), 100);
    }
    stopMove(){
        clearInterval(this.moveInterval);
    }
    changeMoveState(){
        this.moveState += 1;
        if(this.moveInterval === null){
            this.startMove();
        }
        if( this.moveState > 0 ){
            this.moveUp = true;
        }
        if( this.moveState > 1 ){
            this.moveLeft = true;
        }
        if( this.moveState > 2 ){
            this.metaGrid.classList.add("spinning-right");
        }
    }
    move(){
        if( this.moveUp ) {
            this.metaGrid.style.top = ""+this.posX+"px";
            this.posX -= 2;
            if(this.posX < -GRID_SIZE)
                this.posX = 0;
        }
        if( this.moveLeft ){
            this.metaGrid.style.left = ""+this.posY+"px";
            this.posY -= 2;
            if(this.posY < -GRID_SIZE)
                this.posY = 0;
        }
    }
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
            this.bodyLength += GROWTH_PER_APPLE;
            this.appleEaten += 1;
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
        //we need to draw the head and erase the tail
        let tailEnd = document.querySelectorAll("."+getTileClass(...this.tail));
        tailEnd.forEach(tile => tile.classList.remove('snakeBody'));
        //
        let head = document.querySelectorAll("."+getTileClass(...this.snakeBody[0]));
        head.forEach( tile => tile.classList.add('snakeBody'));
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
            this.appleTile = document.querySelectorAll("."+getTileClass(this.x, this.y));
            this.appleTile.forEach( tile => tile.classList.add('appleTile'));
        } else {
            this.regen(snake);
        }
    }
    dispose(){
        this.appleTile = document.querySelectorAll(".appleTile");
        this.appleTile.forEach( tile => tile.classList.remove('appleTile'));
        //appleNew = true; //to see if an apple was eaten, to speed up snake (that is speed whole game up)
    }
}

class GameWorld {
    constructor(){
        this.grid = new Grid();
        this.snake = new Snake();
        this.apple = new Apple();
        this.gameSpeed = START_SPEED;
        this.intervalId = setInterval(() => this.gameLoop(), this.gameSpeed);
        this.debug = new Debug();
    }
    gameLoop(){
        this.snake.move();
        this.snake.draw();
        if( this.snake.collide(this.apple)){
            this.speedUp();
            this.grid.grow();
        }
        // console.log("gm");
    }
    speedUp(){
        clearInterval(this.intervalId);
        this.gameSpeed = Math.floor(this.gameSpeed*SPEED_ACC);
        this.intervalId = setInterval(() => this.gameLoop(), this.gameSpeed);
    }
}

class Debug {
    inputHandle(keypressed){
        if(keypressed == "a"){
            gameWorld.grid.grow();
        }
    }
}

const gameWorld = new GameWorld();

window.addEventListener('keydown', function(event) {
    console.log('Key pressed:', event.key);
    if(event.key.startsWith("Arrow"))
        gameWorld.snake.changeDir(event.key);
    gameWorld.debug.inputHandle(event.key);
});

