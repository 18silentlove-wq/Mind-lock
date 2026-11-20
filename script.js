(() => {
  "use strict";

  const COLOURS = [
    {name:"Coral", value:"#ff6b6b"},
    {name:"Amber", value:"#ffb84d"},
    {name:"Lime", value:"#b8df55"},
    {name:"Mint", value:"#54d6b0"},
    {name:"Blue", value:"#5b9cff"},
    {name:"Violet", value:"#aa83ff"}
  ];
  const MAX_TRIES = 10;
  const secret = [];
  let guess = [];
  let attempts = 0;
  let finished = false;

  const $ = id => document.getElementById(id);
  const slotsEl = $("slots");
  const paletteEl = $("palette");
  const historyEl = $("history");
  const submitBtn = $("submitBtn");
  const helperEl = $("helper");

  function makeSecret() {
    const pool = COLOURS.map((_, index) => index);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 4);
  }

  function renderPalette() {
    paletteEl.replaceChildren();
    COLOURS.forEach((colour, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "colour-key";
      button.style.backgroundColor = colour.value;
      button.setAttribute("aria-label", colour.name);
      button.title = colour.name;
      button.disabled = finished || guess.includes(index) || guess.length >= 4;
      button.addEventListener("click", () => addColour(index));
      paletteEl.append(button);
    });
  }

  function renderSlots() {
    [...slotsEl.children].forEach((button, index) => {
      const colourIndex = guess[index];
      button.classList.toggle("filled", colourIndex !== undefined);
      button.style.backgroundColor = colourIndex === undefined ? "transparent" : COLOURS[colourIndex].value;
      button.textContent = colourIndex === undefined ? "+" : "";
      button.setAttribute("aria-label", colourIndex === undefined ? "Slot " + (index + 1) + ", empty" : "Remove " + COLOURS[colourIndex].name + " from slot " + (index + 1));
      button.disabled = finished || colourIndex === undefined;
    });
    $("selectionCount").textContent = guess.length + " / 4 selected";
    submitBtn.disabled = finished || guess.length !== 4;
  }

  function addColour(index) {
    if (finished || guess.length >= 4 || guess.includes(index)) return;
    guess.push(index);
    helperEl.textContent = guess.length === 4 ? "Ready! Submit your guess." : "Choose " + (4 - guess.length) + " more colour" + (4 - guess.length === 1 ? "." : "s.");
    render();
  }

  function removeColour(position) {
    if (finished || guess[position] === undefined) return;
    guess.splice(position, 1);
    helperEl.textContent = "Choose four different colours.";
    render();
  }

  function render() {
    renderSlots();
    renderPalette();
  }

  function scoreGuess(values) {
    let exact = 0;
    let common = 0;
    values.forEach((value, index) => {
      if (value === secret[index]) exact++;
      if (secret.includes(value)) common++;
    });
    return {exact, misplaced: common - exact};
  }

  function addHistory(values, result) {
    const empty = historyEl.querySelector(".empty-state");
    if (empty) empty.remove();
    const row = document.createElement("div");
    row.className = "history-row";
    const number = document.createElement("span");
    number.className = "row-number";
    number.textContent = String(attempts).padStart(2, "0");
    const colours = document.createElement("div");
    colours.className = "row-colours";
    values.forEach(index => {
      const dot = document.createElement("span");
      dot.className = "mini-colour";
      dot.style.backgroundColor = COLOURS[index].value;
      dot.title = COLOURS[index].name;
      colours.append(dot);
    });
    const pins = document.createElement("div");
    pins.className = "clue-pins";
    for (let i = 0; i < result.exact; i++) {
      const peg = document.createElement("i");
      peg.className = "peg exact";
      pins.append(peg);
    }
    for (let i = 0; i < result.misplaced; i++) {
      const peg = document.createElement("i");
      peg.className = "peg close";
      pins.append(peg);
    }
    row.append(number, colours, pins);
    historyEl.prepend(row);
  }

  function showResult(won) {
    finished = true;
    $("resultIcon").textContent = won ? "✦" : "⌁";
    $("resultTitle").textContent = won ? "Code cracked!" : "Out of attempts";
    $("resultText").textContent = won
      ? "Brilliant deduction! You unlocked the sequence in " + attempts + (attempts === 1 ? " try." : " tries.")
      : "The secret sequence was hidden. Study it and give the next round a try.";
    $("secretReveal").replaceChildren();
    secret.forEach(index => {
      const dot = document.createElement("span");
      dot.style.backgroundColor = COLOURS[index].value;
      dot.title = COLOURS[index].name;
      $("secretReveal").append(dot);
    });
    $("resultModal").hidden = false;
    $("playAgainBtn").focus();
    render();
  }

  function submitGuess() {
    if (finished || guess.length !== 4) return;
    attempts++;
    const result = scoreGuess(guess);
    addHistory([...guess], result);
    $("attemptsLeft").textContent = String(MAX_TRIES - attempts);
    if (result.exact === 4) {
      showResult(true);
      return;
    }
    if (attempts >= MAX_TRIES) {
      showResult(false);
      return;
    }
    guess = [];
    helperEl.textContent = result.exact + " exact, " + result.misplaced + " colour" + (result.misplaced === 1 ? "" : "s") + " in the wrong place. Use the clues!";
    render();
  }

  function newGame() {
    secret.splice(0, secret.length, ...makeSecret());
    guess = [];
    attempts = 0;
    finished = false;
    $("attemptsLeft").textContent = String(MAX_TRIES);
    $("resultModal").hidden = true;
    historyEl.replaceChildren();
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const icon = document.createElement("span");
    icon.className = "lock-symbol";
    icon.textContent = "⌁";
    const title = document.createElement("strong");
    title.textContent = "Your attempts will appear here";
    const note = document.createElement("small");
    note.textContent = "Choose four colours below to make your first guess.";
    empty.append(icon, title, note);
    historyEl.append(empty);
    helperEl.textContent = "Pick four different colours. Tap a filled slot to remove it.";
    render();
  }

  [...slotsEl.children].forEach((button, index) => {
    button.addEventListener("click", () => removeColour(index));
  });
  submitBtn.addEventListener("click", submitGuess);
  $("clearBtn").addEventListener("click", () => {
    if (finished) return;
    guess = [];
    helperEl.textContent = "Choose four different colours.";
    render();
  });
  $("newGameBtn").addEventListener("click", newGame);
  $("playAgainBtn").addEventListener("click", newGame);

  newGame();
})();