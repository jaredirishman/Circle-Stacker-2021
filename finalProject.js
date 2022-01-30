////////////////////// SETUP ///////////////////////////////
var canvas;
var ctx;
var w = 1080;
var h = 1080;
var oneDegree = Math.PI/180; /// same as 2*Math.Pi/360


o1 = { /// object that holds values for making the interior circle
    "x" : w/2,
    "y" : h/2,
    "c" : randn(100)+360, /// random color value: 360 +/- 50
    "fc" : "hsla(0,0%,100%,1)", /// white in hsla
    "d" : 5,
    "r" : 100,
}

oLimit = { /// object that holds values for making the background circle
    "x" : w/2,
    "y" : h/2,
    "a" : .1,
    "c" : o1.c, /// colour based on object 1 because it's randomized
    "d" : 0,
    "r" : w/2-25, 
}

var currentLevel = 0; /// holds the value of current level
var difficulty = 1; /// difficulty which effects speed and block spawn rate
var highScore = 0; /// holds value of highest points achieved
var lastScore = 0; /// holds value of previous score achieved
var points; /// holds value for number of points in the current game
var world = 1; /// world number based on how many completed rounds
var deleting = 0; /// variable to determine when blocks are being deleted
var mult; /// holds value for score multiplier

/// array to hold all the block objects
let allBlocks = [];


document.querySelector("#myCanvas").onclick = click;



////////////////////// EXECUTABLE CODE /////////////////////

setUpCanvas();
console.log("Ready to go!");

animationLoop();



////////////////////// FUNCTIONS ///////////////////////////
function animationLoop(){
    clear(); /// clears the screen at the beginning of every frame
    circle(oLimit); /// draws background circle
    limitRing(); /// updates radius and alpha value of background circle
    pointCheck(); /// checks how many blocks are on the screen to calculate points
    pointPrint(); /// prints points and other messages to the screen

    if(allBlocks.length < currentLevel || currentLevel > 16){ 
        /// runs endGame() if the player made it to the end, 
        /// or if there is an empty layer meaning the player lost
        endGame();
    } else { 
        /// otherwise, run the game
        runGame();
    }
    requestAnimationFrame(animationLoop);
}

function runGame(){ /// draws all the blocks and updates their position, draws collision radius if needed
    for (var i = 0; i<allBlocks.length; i++){
        // showCollisionRadius(allBlocks[i]);
        if(allBlocks[i][0].level == currentLevel-1){ /// filters for top layer
            blockDrawUpdate(allBlocks[i]); /// updates position of blocks
        } else { reverse(allBlocks[i]) } /// reverses rotation off all but top layer 
        drawBlocks(allBlocks[i]); /// draws all the blocks onto the screen
    }
}

function endGame(){ /// removes all blocks frame-by-frame started from end of array, updates highscore and points multiplier
    if(allBlocks.length != 0){ /// filters out if allBlocks is an empty array
        checkScore(); /// update highscore
        remove(allBlocks[allBlocks.length-1], allBlocks[allBlocks.length-1].length-1); /// remove to last block in entire array
        deleting++; /// increments deleting variable to indicate when blocks are being deleted
    } else { /// once everything is removed from allBlocks
        if(currentLevel > 16){ /// filters for if player made it to the end of the world
            difficulty+=0.25; /// make the next round harder
            world += 1; /// go to next world
        } else { /// if player didnt make it to the end
            difficulty = 1; /// reset difficulty back to 1
            world = 1; /// reset world back to 1
        }
        currentLevel = 0; /// reset current level back to 0
        deleting = 0; /// reset deleting variable back to 0
    }
    for (var i = 0; i<allBlocks.length; i++){ /// draws all blocks that still exist
        drawBlocks(allBlocks[i]);
    }
    if(deleting == 1){ /// only when the first block gets deleted
        mult = allBlocks[allBlocks.length-2].length; /// create a variable for the number of blocks at the 16th level
        console.log("multiplier: "+mult); 
        lastScore = points*mult; /// holds points * multiplier as lastScore
        
        console.log("last score: "+lastScore);
    }
}

function checkScore(){ /// checks if highscore needs to be updated based on current score
    if(points > highScore){ 
        highScore = points;
    }
}

function limitRing(){ /// effect that causes the background circle to oscilate in size and opacity
    oLimit.d++;
    oLimit.r += Math.cos(oLimit.d/100)/50; /// changes radius of background circle using a cosine wave
    oLimit.a += Math.cos(oLimit.d/100)/2000; /// changes opacity of background circle using a cosine wave
    o1.d++;
    o1.r += Math.cos(o1.d/100)/10; /// changes radius of inner circle using a cosine wave
}

function startInstructions(){ /// instructions printed to middle of canvas at start of game
        var size = 28;
        var x = w/2 - 81;
        var y = h/2 + size/3;

        ctx.font = ""+size+"px Helvetica";
        ctx.fillStyle = "hsla("+o1.c+",100%,50%,0.7)";
        ctx.fillText("CLICK", x + 40, y - (size*1.25));
        ctx.fillText("ANYWHERE", x, y );
        ctx.fillText("TO START", x + 15, y + (size*1.25));
}

function playMessage(){ /// message printed to middle of canvas when player advances the world
    var size = 26;
    var x = w/2 - 73;
    var y = h/2 + size/2;

    ctx.font = ""+size+"px Helvetica";
    ctx.fillStyle = "hsla("+o1.c+",100%,50%,0.7)";
    ctx.fillText("GOOD JOB!", x, y - (size*1.25));
    ctx.fillText("KEEP IT UP", x, y );
    ctx.fillText("BROSKI!", x + 15, y + (size*1.25));
}

function pointPrint(){ /// prints the points as well as game messages to the canvas based on level, world and score
    
    circle(o1); /// creates a white circle in the middle of the screen for the points and messages to display on

    if (currentLevel != 0){ /// filters out level 0
        var characters = points.toString().length; /// gets the number of characters in the points variable      
        var size = 300/(1+characters);  /// size of text based on number of characters in points variable
        var x = w/2 - size*characters/3.65;
        var y = h/2 + size/3;
        

        ctx.font = ""+size+"px Helvetica";
        ctx.fillStyle = "hsla("+o1.c+",100%,50%,0.7)";
        ctx.fillText(points, x, y); /// prints the current score to the center of the screen

        /// filters for when blocks are deleting and player made it to the next round 
        if(deleting > 0 && currentLevel > 16){ 
            var size = 100+3*deleting; /// size of text, increases as blocks are being deleted
            var x = w/2-size/2;
            var y = h/2 + size/2;
            var multiplier = ""+mult+"x"; /// message to display the multiplier value
            var a = 1-deleting/30; /// alpha value decreases as blocks are being deleted

            ctx.font = ""+size+"px Helvetica";
            ctx.fillStyle = "hsla(120,100%,50%,"+a+")";
            ctx.fillText(multiplier, x, y); /// displays multiplier value growing from centre of screen

            /// filters for when pieces are being deleted but player didnt make it to the next round
        } else if(deleting > 0 && currentLevel <= 16){ 
            var size = 100+3*deleting; /// size of text, increases as blocks are being deleted
            var x = w/2-size*2.5;
            var y = h/2 + size/2;
            var message = "YOU LOSE"; /// message to be displayed
            var a = 1-deleting/30; /// alpha value decreases as blocks are being deleted

            ctx.font = ""+size+"px Helvetica";
            ctx.fillStyle = "hsla(10,100%,50%,"+a+")"; 
            ctx.fillText(message, x, y); /// displays 'you lose' message growing from centre of screen
        }
    } else {
        if(world == 1){ /// filters for world 1 to print start instructions
            startInstructions();
        } else { /// prints different message if player made it to the next world
            playMessage();
        }
    }
    if(highScore > 0){ /// filters out when no highscore has been achieved
        ctx.font = ""+30+"px Helvetica";
        ctx.fillStyle = "hsla("+o1.c+",100%,50%,0.7)";
        ctx.fillText("HIGHSCORE: "+highScore, 50, 50); /// prints highscore to top left of screen
    }
}

function pointCheck(){ /// calculates number of blocks on the screen to track points, adds previous score if applicable
    var numBlocks = 0;
    /// adds the length of each array within allBlocks to numBlocks variable
    for (var i = 0; i < allBlocks.length-1; i++){ 
        numBlocks += allBlocks[i].length; 
    }
    
    if(world > 1 && deleting < 1){ /// filters for if the player made it to world 2
        points = (numBlocks + lastScore); /// sets points to sum of numBlocks and lastScore
    } else {
        points = numBlocks; /// sets the point value to numBlocks
    }
}

function remove(a, o){ /// takes an object and its parent array in order to remove it from the array
    var index = 0;
    index = a.indexOf(o); /// gets the objects position within the array
    a.splice(index, 1); /// removes object at position 'index'
    if(a.length == 0){ /// filters for if the parent array is empty
        var index = 0; 
        index = allBlocks.indexOf(a); /// gets the parent array's position within its array
        allBlocks.splice(index, 1); /// removes array from its parent at position 'index'
    }
}

function showCollisionRadius(a){ /// draws circles to show the radius for collision detection
    for(var i = 0; i < a.length; i++){ 
        circle(a[i]);
    }
}

function collisionCheck(a1, a2){ /// takes 2 arays and iterates through first array to test for collisions against second 
    for (var i = 0; i < a1.length; i++){
        collisionRemove(a1[i],a2);
    }
}

function collisionRemove(o,a){ /// tests an object against an array for collisions
    for(var i = a.length-1; i >= 0; i--){ /// iterates through array backwards
        var difX = Math.abs(o.x-a[i].x); /// absolute x distance between object and array of objects
        var difY = Math.abs(o.y-a[i].y); /// absolute y distance between object and array of objects
        var hdist = Math.sqrt(difX * difX + difY * difY); /// uses x and y composites to determine distance 
        if(hdist < o.r+a[i].r){ /// filters for if the distance is less than sum of radii
            o.numCollisions++; /// keeps track of collisions
            o.c = o1.c; /// changes colour of block to match the rest
        }
    }
    if(o.numCollisions == 0){ /// filters for all blocks that have no collisions
        o.numCollisions -= 1; /// sets value to -1 in order to filter blocks for deletion in drawBlocks
    }    
}

function click(){ /// on mouse click; test for collisions of current level against previous level, calls nextLevel 
    for(var i = 0; i < 1; i++){
        if(currentLevel >= 2){ // filters out first level because there is nothing to compare collisions against
            collisionCheck(allBlocks[currentLevel-1], allBlocks[currentLevel-2]); /// checks collisions of current layer agains last layer
        }
            if(currentLevel != 0){ /// filters for when 1 layer exists
                for(var j = 0; j < allBlocks[currentLevel-1].length; j++){ /// iterates through blocks on last level
                     /// rotates block by -changle once, so that they revolve in a perfect circle in reverse
                    allBlocks[currentLevel-1][j].angle -= allBlocks[currentLevel-1][j].changle;
                }
            } 
            nextLevel(); 
    }
}

function reverse(a){ /// iterates through an array of objects, applying forward and turn functions with a negative value
    for (var i = 0; i < a.length; i++){
        // a[i].angle += a[i].changle;
        forward(a[i], -a[i].d);
        
        turn(a[i], -a[i].changle);
    }
}

function blockDrawUpdate(a){ /// iterates through array of objects, applying forward and turn functions
    for (var i = 0; i < a.length; i++){
        blockForward(a[i]);
        blockTurn(a[i]);
    }
}

function createBlocks(level){ /// takes level and creates an array for the next ring of blocks 
    allBlocks.push(new Array(1)); /// creates a new array at the end of allBlocks
    var i = level-1; 
    var blockHeight = 20;
    var blockWidth = 30; 
    var num = 20 + i * 4; /// number of blocks in a ring
    var oDist = 25; /// distance between rings
    var rad = 125 + i * oDist; /// distance from centre of screen to current ring
    /// calculates displacement of block in relation to its radius, scales with difficulty
    var disp = Math.sqrt(2*Math.pow(rad,2)-2*Math.pow(rad,2)*Math.cos(Math.PI/180))*difficulty; 
    // var height = (Math.sqrt(Math.pow(disp,2)-Math.pow((Math.PI/360*disp),2)));
    var theta = 1*difficulty; /// angle for turn function, scales with difficulty

    allBlocks[i] = []; /// initializes allBlocks[i] as array
    for(var j = 0; j < num; j++){
        /// x & y components of block position, iterated in a circle around centerpoint, scales with radius
        var xOffset = Math.cos(j*Math.PI/num*2)*rad; 
        var yOffset = Math.sin(j*Math.PI/num*2)*rad;
        allBlocks[i].push({
            "x" : w/2 + xOffset,
            "y" : h/2 + yOffset,
            "w" : blockWidth,
            "h" : blockHeight,
            "c" : o1.c - 15*i, //j*360/num, /// colour based on background circle
            "a" : 0.6+randn(.3), /// randomized alpha value to give block patterns more texture
            "d" : disp,
            "r" : 17.5,
            "angle" : (360/num*j+90)+theta/2, /// initial angle of shape based on position in circle
            "changle" : theta,
            "level" : i,
            "void" : rand(1.4)+currentLevel/30*difficulty, /// random number used to filter whether or not the block gets created based on level and difficulty
            "numCollisions" : 0, ///variable to test for collisions
        })
    }
}

function nextLevel(){ /// advances the current level and creates blocks for the next level
    currentLevel++;
    
    if(currentLevel <= 16){
        createBlocks(currentLevel);
    }
}

function drawBlocks(a){ /// Draws all blocks and filters out the ones that should be deleted
    if (a.length >= 0){
        for (var i = 0; i<a.length; i++){
            if (a[i].void <= 1 && a[i].numCollisions >= 0 || a[i].level == 0){
                rect(a[i])
            } else { 
                remove(a, a[i]);
            }
        }
    }
}

////////////////////// BASE FUNCTIONS //////////////////////
function clear(){ 
    ctx.clearRect(0,0,w,h);
}

function blockTurn(o){ /// same as turn(), without d variable
    o.angle += o.changle;
}

function blockForward(o){ /// same as forward(), without d variable
    var changeX;
    var changeY;
    
    changeX = o.d*Math.cos(o.angle*oneDegree);
    changeY = o.d*Math.sin(o.angle*oneDegree);

    o.x += changeX;
    o.y += changeY;
}

function turn(o, angle){
    var holdAngle;
    if(angle != undefined){
        holdAngle = o.changle;
        o.changle = angle;
    };
    o.angle += o.changle;
    
    if(holdAngle != undefined){
        o.changle = holdAngle;
    }
}

function forward(o, d){
    var changeX;
    var changeY;
    var holdDist;
    
    if(d != undefined){
        holdDist = o.d;
        o.d = d;
    };
    changeX = o.d*Math.cos(o.angle*oneDegree);
    changeY = o.d*Math.sin(o.angle*oneDegree);
    o.x += changeX;
    o.y += changeY;
    if(holdDist != undefined){
        o.d = holdDist;
    }
}

function rect(o){
    var x = o.x;
    var y = o.y;
    var a = o.angle;
    var d = o.d;

    // o.x -= o.w/2;
    // o.y -= o.h/2;
    turn(o, 180);
    forward(o, o.w/2);
    turn(o,90);
    forward(o, o.h/2);
    turn(o, 90);

    c = o.x+o.y;
    ctx.fillStyle = "hsla("+o.c+",100%,50%,"+o.a+")";
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    forward(o, o.w); /// updating x and y coords
    ctx.lineTo(o.x, o.y);
    turn(o, 90);
    forward(o, o.h);
    ctx.lineTo(o.x, o.y);
    turn(o, 90);
    forward(o, o.w);
    ctx.lineTo(o.x, o.y);
    turn(o, 90);
    forward(o, o.h);
    ctx.lineTo(o.x, o.y);
    // ctx.strokeStyle = "hsla("+o.x+",100%,50%,"+o.a+")";
    // ctx.lineWidth = 2;
    // ctx.stroke();
    ctx.fill();
    

    o.x = x;
    o.y = y;
    o.angle = a;
    o.d = d;
}

function circle(o){
    ctx.beginPath();
    ctx.arc(o.x,o.y,o.r,o.r,0,2*Math.PI);
    if(o.fc){
        ctx.fillStyle = o.fc; 
    } else {
        ctx.fillStyle = "hsla("+o1.c+",100%,50%,"+o.a+")";
    }
    ctx.fill();
    ctx.strokeStyle = "hsla("+o.c+",100%,50%,"+o.a+")";
    ctx.lineWidth = 8;
    // ctx.stroke();
}

function rand(r){
    var result = Math.random()*r;
    return result;
}

function randn(r){
    var result = Math.random()*r - r/2;
    return result;
}

function randi(r){
    var result = Math.floor(Math.random()*r);
    return result
}

function setUpCanvas(){
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;
    // canvas.style.border = "5px dashed black";
}






