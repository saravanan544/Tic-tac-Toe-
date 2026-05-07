import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  onValue,
  get,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJixfgbhJ5Wwi7KvFblLplpP7PjRdQiII",
  authDomain: "tic-tac-toe-62dc6.firebaseapp.com",
  databaseURL: "https://tic-tac-toe-62dc6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tic-tac-toe-62dc6",
  storageBucket: "tic-tac-toe-62dc6.firebasestorage.app",
  messagingSenderId: "127314699154",
  appId: "1:127314699154:web:5ca2b1fd37d44c4697574b",
  measurementId: "G-DQ1T4XRY89"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");

let roomId = "";
let player = "";
let gameData = null;

const winning = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;
  cell.addEventListener("click", makeMove);
  boardElement.appendChild(cell);
}

window.joinRoom = async function () {
  roomId = document.getElementById("roomInput").value;

  if (!roomId) return;

  const roomRef = ref(db, "rooms/" + roomId);

  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {

    player = "X";

    await set(roomRef, {
      board: ["","","","","","","","",""],
      turn: "X",
      players: 1,
      winner: ""
    });

  } else {

    player = "O";

    await update(roomRef, {
      players: 2
    });
  }

  listenGame();
};

document.getElementById("joinBtn")
.addEventListener("click", joinRoom);

function listenGame() {

  const roomRef = ref(db, "rooms/" + roomId);

  onValue(roomRef, (snapshot) => {

    gameData = snapshot.val();

    if (!gameData) return;

    updateBoard();

    if (gameData.winner) {
      statusText.innerText =
        gameData.winner + " Wins!";
    } else {
      statusText.innerText =
        "Turn: " + gameData.turn;
    }
  });
}

async function makeMove(e) {

  if (!gameData) return;

  const index = e.target.dataset.index;

  if (gameData.board[index] !== "") return;

  if (gameData.turn !== player) return;

  if (gameData.winner) return;

  let newBoard = [...gameData.board];

  newBoard[index] = player;

  let winner = checkWinner(newBoard);

  const nextTurn =
    player === "X" ? "O" : "X";

  await update(
    ref(db, "rooms/" + roomId),
    {
      board: newBoard,
      turn: nextTurn,
      winner: winner
    }
  );
}

function updateBoard() {

  const cells =
    document.querySelectorAll(".cell");

  cells.forEach((cell, i) => {
    cell.innerText =
      gameData.board[i];
  });
}

function checkWinner(board) {

  for (let combo of winning) {

    const [a,b,c] = combo;

    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }
  }

  return "";
    }
