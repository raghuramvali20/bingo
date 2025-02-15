const socket = io();
const board = document.getElementById("board");
const gridBox = document.querySelectorAll(".grid");
const body = document.querySelector("body");
const numberToIndexMap = {}; // Mapping of number to index
const messageBox = document.getElementById("messageBox");

let flag = 0;


const params = new URLSearchParams(window.location.search);
let name = params.get('name');


socket.emit("roomMemberJoin", name);
let RoomMembers = [name];
socket.on('roomMemberList', (roomMembers) => {
    RoomMembers.push(roomMembers[1]);
    console.log(roomMembers[0],roomMembers[1]);
});

const userClickedNumbers = [[], []]; // First array for opponent, second for user
const randomArr = (n) => {
    const set = new Set();
    while (set.size < n) set.add(Math.floor(Math.random() * n) + 1);
    Array.from(set).forEach((num, i) => {
        gridBox[i].textContent = num;
        numberToIndexMap[num] = i; // Populate the mapping
    });
};
randomArr(25);

gridBox.forEach((element) => {
    element.addEventListener("click", function changeColor() {
        const num = parseInt(element.textContent);
        if (![...userClickedNumbers[0], ...userClickedNumbers[1]].includes(num) && flag === 0) {
            element.style.backgroundColor = "#f00";
            element.removeEventListener("click", changeColor);
            userClickedNumbers[1].push(num);
            console.log("User clicked numbers:", userClickedNumbers[1]);
            Striking(
                [...userClickedNumbers[0], ...userClickedNumbers[1]].map(
                    (n) => numberToIndexMap[n]
                )
            ); // Map numbers to indexes for checking
            socket.emit("gridSelected", num); // Emit selection number to server
            flag++;
        } else if (flag === 1) alert("wait for openent selection");
    });
});

function Striking(indexes) {
    let strikedRows = 0;
    console.log("Indexes for checking:", indexes);

    if ([0, 1, 2, 3, 4].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([5, 6, 7, 8, 9].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([10, 11, 12, 13, 14].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([15, 16, 17, 18, 19].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([20, 21, 22, 23, 24].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([0, 5, 10, 15, 20].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([1, 6, 11, 16, 21].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([2, 7, 12, 17, 22].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([3, 8, 13, 18, 23].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([4, 9, 14, 19, 24].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([0, 6, 12, 18, 24].every((element) => indexes.includes(element)))
        strikedRows += 1;
    if ([4, 8, 12, 16, 20].every((element) => indexes.includes(element)))
        strikedRows += 1;

    console.log("Number of striked rows:", strikedRows);
    if (strikedRows === 5) {
        socket.emit('winner', [RoomMembers[0],'winned the match'])
    }
}

socket.on("opponentGridSelected", (number) => {
    gridBox.forEach((element) => {
        if (parseInt(element.textContent) === number) {
            element.style.backgroundColor = "#00f";
            userClickedNumbers[0].push(number); // Add to opponent's array
            console.log("Opponent clicked numbers:", userClickedNumbers[0]);
            Striking(
                [...userClickedNumbers[0], ...userClickedNumbers[1]].map(
                    (n) => numberToIndexMap[n]
                )
            ); // Map numbers to indexes for checking
            flag = 0;
        }
    });
});

socket.on("message", (message) => {
    console.log(message);
    messageBox.style.display = 'flex';
    messageBox.textContent = message;
    if(message === 'Waiting for another player to join'){
        const loading = document.createElement('div');
        loading.classList.add('loading');
        messageBox.appendChild(loading);
        console.log
    }
    else{
        body.addEventListener('click', () => {
            messageBox.style.display = 'none';
            if(message === `${RoomMembers[0]} winned the match` || message === `${RoomMembers[1]} winned the match` || message === 'Oponent has left the game'){  
                console.log(RoomMembers[0],RoomMembers[1])  
                window.location.href = '/'
             }
        });
    }
});

socket.on("roomFilled", () => {
    messageBox.style.display = 'none'; // Hide loading message when room is filled
});
