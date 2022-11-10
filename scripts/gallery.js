window.onload = function() {
    galleryParallel();
    init();
}

function loadImg (url, id) {
    let promise = new Promise (function (resolve, reject) {
        let img = document.getElementById(id);
        img.src = url;
        img.onload = function () { resolve(url); };
        img.onerror = function () { reject(url); };
    });
    return promise;
}
function galleryParallel() {
    let promiseArr = [];
    for (let i = 1; i < 13; i++) {
        promiseArr[i] = loadImg("images/" + i + ".png", "img" + i);
    }
    Promise.all(promiseArr).then(function() {
        console.log("Galeria załadowna.");
    }).catch(function(){
        console.log("Błąd ładowania.");
    })
}