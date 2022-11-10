//TODO touchstart touchend -> touchmove, JS alert

var _canvas;
var _stage;
var _img;
var _numberRow;
var _numberCol;
var _puzzleWidth;
var _puzzleHeight;
var _pieces = [];
var _url;

function init() {
    _img = new Image();
    _img.src = "//:0";
    for (let i = 1; i < 13; i++) {
        document.getElementById("img" + i).onclick = function() {
            _img.src = this.src;
            for (let j = 1; j < 13; j++) {
                document.getElementById("img" + j).style.borderStyle = "none";
            }
            this.style.border = "solid 3px rgba(0, 0, 0, 0)";
        };
    }

    document.getElementById("startBtn").addEventListener("click", startGame);
}

function startGame() {
    _numberRow = document.getElementById("row").value;
    _numberCol = document.getElementById("col").value;
    if (_img.src === "http://:0/" || _img.src === "https://:0/" || typeof _img.src === "undefined") {
        alert("Wybierz obrazek.");
    }
    _url = new Image();
    _url.src = _img.src;
    if (!Number.isInteger(+_numberRow) || !Number.isInteger(+_numberCol)
        || +_numberRow < 4 || +_numberCol < 4) {
        alert("Wprowadź całkowite wartości liczbowe większe bądź równe 4.");
    } else {
        _pieces = [];
        createPieces();
    }
}

class Piece {
    constructor() {
        this.width = Math.floor(_img.width / _numberCol);
        this.height = Math.floor(_img.height / _numberRow);
        this.xPos = 0;
        this.yPos = 0;
        this.sx = 0;
        this.sy = 0;
        this.id = 0;
    }
}

function createPieces() {
    for (let i = 0; i < _numberCol * _numberRow - 1; i++) {
        _pieces[i] = new Piece();
    }
    let xPos = _pieces[0].width;
    let yPos = 0;
    _puzzleHeight = _pieces[0].height * _numberRow;
    _puzzleWidth = _pieces[0].width * _numberCol;
    for (let i = 0; i < _numberCol * _numberRow - 1; i++) {
        _pieces[i].id = i + 1;
        _pieces[i].sx = xPos;
        _pieces[i].sy = yPos;
        xPos +=  _pieces[i].width;
        if (xPos >= _puzzleWidth) {
            xPos = 0;
            yPos += _pieces[i].height;
        }
    }
    setCanvas();
}

function setCanvas() {
    _canvas = document.getElementById("canvas");
    _stage = _canvas.getContext("2d");
    _canvas.width = _puzzleWidth;
    _canvas.height = _puzzleHeight;
    shufflePuzzle();
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    //check parity -- needs to be even in order to be solvable
    let counter = 0;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < i; j++ ) {
            if (arr[j].id > arr[i].id) {
                counter += 1;
            }
        }
    }
    if (counter % 2 === 1) { //permutation is odd -- add one swap to change to even
        [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    return arr;
}

function drawPiece(i) {
    _stage.drawImage(_url, _pieces[i].sx, _pieces[i].sy, _pieces[i].width, _pieces[i].height, _pieces[i].xPos, _pieces[i].yPos, _pieces[i].width, _pieces[i].height);
    _stage.save();
    _stage.strokeStyle = "rgb(255,255,255)";
    _stage.lineWidth = 5;
    _stage.strokeRect(_pieces[i].xPos, _pieces[i].yPos, _pieces[i].width, _pieces[i].height);
    _stage.restore();
}

function drawRedPiece() {
    let red = _pieces[getRedPiece()];
    _stage.fillStyle = "#c44959";
    _stage.fillRect(red.xPos + 1, red.yPos + 1, red.width - 4, red.height - 4);
    _stage.restore();
}

function shufflePuzzle() {
    _stage.clearRect(0,0,_puzzleWidth,_puzzleHeight);
    _pieces = shuffleArray(_pieces);
    //drawing the shuffled pieces
    let xPos = _pieces[0].width;
    let yPos = 0;
    let piece;
    for (let i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        piece.xPos = xPos;
        piece.yPos = yPos;
        drawPiece(i);
        xPos +=  _pieces[i].width;
        if (xPos >= _puzzleWidth) {
            xPos = 0;
            yPos += _pieces[i].height;
        }
    }
    // creating the red empty piece
    let redPiece = new Piece();
    _pieces.unshift(redPiece);
    drawRedPiece();

    /*document.onmousemove = highlightPiece;
    document.onclick = swapPieces;*/
    _canvas.addEventListener('mousemove', highlightPiece, {passive: false});
    _canvas.addEventListener('click', swapPieces, {passive: false});
    _canvas.addEventListener('touchstart', highlightPiece, {passive: false});
    _canvas.addEventListener('touchend', swapPieces, {passive: false});
}

function getPiece(mouse) {
    for (let i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        if ((mouse.x > _pieces[i].xPos && mouse.x < _pieces[i].xPos + _pieces[i].width)
            && (mouse.y > _pieces[i].yPos && mouse.y < _pieces[i].yPos + _pieces[i].height)) {
            return i;
        }
    }
    return null;
}

function getRedPiece() {
    for (let i = 0; i < _pieces.length; i++) {
        if (_pieces[i].id === 0) {
            return i;
        }
    }
}

function isNextToRed(piece) {
    if (piece !== null) {
        let red = _pieces[getRedPiece()];
        if ((piece.xPos === piece.width + red.xPos ||
            piece.xPos === -piece.width + red.xPos)
            && piece.yPos === red.yPos ||
            (piece.yPos === piece.height + red.yPos ||
                piece.yPos === -piece.height + red.yPos)
            && piece.xPos === red.xPos) {
            return true;
        }
    }
    return false;
}

function setMouse(event) {
    let limit = _canvas.getBoundingClientRect();
    //images are scaled in css
    let scaleX = _canvas.width / limit.width;
    let scaleY = _canvas.height / limit.height;
    //mouse coordinates
    let mouse = {};
    mouse.x = (event.clientX - limit.left) * scaleX;
    mouse.y = (event.clientY - limit.top) * scaleY;
    // touch screens
    if (Number.isNaN(mouse.x) || Number.isNaN(mouse.y)) {
        let touches = event.changedTouches;
        mouse.x = (touches[0].pageX - limit.left) * scaleX;
        mouse.y = (touches[0].pageY - limit.top) * scaleY - _pieces[0].height;
    }
    event.preventDefault();
    return mouse;
}

function highlightPiece(event) {
    //store img inside a temp var
    let mouse = setMouse(event);
    let hoveredPiece = _pieces[getPiece(mouse)];
    if (hoveredPiece !== null) {
        //remove previous highlight
        for (let i = 0; i < _pieces.length; i++) {
            if (_pieces[i].id !== 0) {
                drawPiece(i);
            }
        if(isNextToRed(hoveredPiece)) {
                _stage.save();
                _stage.fillStyle = "indigo";
                _stage.globalAlpha = .08;
                _stage.fillRect(hoveredPiece.xPos + 1, hoveredPiece.yPos + 1,
                    hoveredPiece.width - 5, hoveredPiece.height - 5);
                _stage.restore();
            }
        }
    }
}

function isWon() {
    for (let i = 0; i < _pieces.length - 1; i++) {
        if (_pieces[i].id > _pieces[i + 1].id) {
            return false;
        }
    }
    return true;
}

function finish() {
    _canvas.removeEventListener('mousemove', highlightPiece, {passive: false});
    _canvas.removeEventListener('click', swapPieces, {passive: false});
    _canvas.removeEventListener('touchstart', highlightPiece, {passive: false});
    _canvas.removeEventListener('touchend', swapPieces, {passive: false});
    _stage.drawImage(_img, 0, 0);
    _stage.save();
    _stage.fillStyle = "#f7f7f7";
    _stage.globalAlpha = .4;
    let msgHeight = 60;
    let msgWidth = 500;
    _stage.fillRect((_puzzleWidth - msgWidth) / 2, _puzzleHeight - msgHeight - 50,
        msgWidth, msgHeight);
    _stage.fillStyle = "#000000";
    _stage.globalAlpha = 1;
    _stage.font = "40px Antic Slab";
    _stage.fillText("Koniec gry. Gratulacje!", (_puzzleWidth - msgWidth) / 2 + 50,
        _puzzleHeight - msgHeight + 40 - 46);
    _stage.restore();
}

function swapPieces(event) {
    let mouse = setMouse(event);
    //console.log("X " + mouse.x + " Y " + mouse.y);
    let clkdPiece = getPiece(mouse);
    let clickedPiece = _pieces[clkdPiece];
    if (clickedPiece !== null) {
        let redPiece = _pieces[getRedPiece()];
        if (isNextToRed(clickedPiece)) {
            // swap
            [_pieces[getRedPiece()], _pieces[clkdPiece]] = [_pieces[clkdPiece], _pieces[getRedPiece()]];
            let tempX = redPiece.xPos;
            let tempY = redPiece.yPos;
            redPiece.xPos = clickedPiece.xPos;
            redPiece.yPos = clickedPiece.yPos;
            clickedPiece.xPos = tempX;
            clickedPiece.yPos = tempY;
            for (let i = 0; i < _pieces.length; i++) {
                if (_pieces[i].id !== 0) {
                    drawPiece(i);
                }
            }
            drawRedPiece();

           if(isWon()) {
                finish();
           }
        }
    }
}