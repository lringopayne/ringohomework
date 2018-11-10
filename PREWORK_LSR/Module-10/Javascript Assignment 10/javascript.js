document.addEventListener('DOMContentLoaded', function(){
    let btn2 = document.getElementById('button2');
    btn2.addEventListener('click', function(){
let div = document.getElementById('box');
div.style.backgroundColor = 'blue';
    })
    let i=1;
    let btn1 = document.getElementById('button1');
    btn1.addEventListener('click', function(){
let div = document.getElementById('box');
let grow =(150 + (10*i))+'px';
div.style.width = grow;
div.style.height= grow;
i++;
    })
    let j=1
    let btn3 = document.getElementById('button3');
    btn3.addEventListener('click', function(){
let div = document.getElementById('box');
let fade = (100 - (10*j))/100;
div.style.opacity = fade;
j++
    })
    let btn4 = document.getElementById('button4');
    btn4.addEventListener('click', function(){
let div = document.getElementById('box');
div.style.backgroundColor = 'orange';
div.style.opacity = 1;
div.style.height = '150px';
div.style.width = '150px';
i=1;
j=1;
    })
})