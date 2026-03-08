const CARDS_PER_ROW = 2;
const ROW_TIERS = ["gold", "silver", "bronze"];
const PLAYER_ITEM_SLOTS = 6;
const DICE_COUNT = 6;
const DICE_STATES = ["red", "green", "blue", "light", "dark", "fusion"];
const TRACKED_TOKENS = [
  { key: "red", kind: "token", value: "red" },
  { key: "green", kind: "token", value: "green" },
  { key: "blue", kind: "token", value: "blue" },
  { key: "light", kind: "token", value: "light" },
  { key: "dark", kind: "token", value: "dark" },
  { key: "rainbow", kind: "emoji", emoji: "🌈" },
  { key: "magic", kind: "emoji", emoji: "🔮" },
];

const CARD_BACKGROUNDS = {
  red: "var(--card-red)",
  green: "var(--card-green)",
  blue: "var(--card-blue)",
  black: "var(--card-black)",
  light: "var(--card-light)",
  dark: "var(--card-dark)",
  fusion: "var(--card-fusion)",
  rainbow: "var(--card-rainbow)",
};

const CARD_FRAME_WIDTH = 8;

const RARITY_BORDERS = {
  none: { color: "var(--silver)", width: CARD_FRAME_WIDTH },
  bronze: { color: "var(--bronze)", width: CARD_FRAME_WIDTH },
  silver: { color: "var(--silver)", width: CARD_FRAME_WIDTH },
  gold: { color: "var(--gold)", width: CARD_FRAME_WIDTH },
};

const STAR_STYLES = {
  bronze: { color: "#b45309", scale: 0.7, label: "B", labelColor: "#f8fafc", labelScale: 0.28 },
  silver: { color: "#64748b", scale: 1.1, label: "S", labelColor: "#f8fafc", labelScale: 0.34 },
  gold: { color: "#ca8a04", scale: 1.6, label: "G", labelColor: "#111827", labelScale: 0.4 },
};

const COLOR_COSTS = {
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
};

const TOKEN_ACCENTS = {
  red: "#fca5a5",
  green: "#86efac",
  blue: "#93c5fd",
  light: "#fff8ef",
  dark: "#4b5563",
  fusion: "#c4b5fd",
  heart: "#fff8ef",
  skull: "#c4b5fd",
  star: "#4b5563",
};

const SPECIALS = {
  light: { fill: "#fff8ef", glyph: "☀", glyphColor: "#92400e" },
  dark: { fill: "#111827", glyph: "☾", glyphColor: "#f8fafc" },
  fusion: { fill: "#7c3aed", glyph: "✦", glyphColor: "#f8fafc" },
  // Backward compatibility for existing card/item data.
  heart: { fill: "#fff8ef", glyph: "☀", glyphColor: "#92400e" },
  skull: { fill: "#7c3aed", glyph: "✦", glyphColor: "#f8fafc" },
  star: { fill: "#111827", glyph: "☾", glyphColor: "#f8fafc" },
};

const gridElement = document.querySelector("#card-grid");
const statusElement = document.querySelector("#status-text");
const itemButtons = document.querySelectorAll("[data-item-tier]");
const playersListElement = document.querySelector("#players-list");
const tokensListElement = document.querySelector("#tokens-list");
const diceGridElement = document.querySelector("#dice-grid");
const rollAllDiceButton = document.querySelector("#roll-all-dice");
const rerollSelectedDiceButton = document.querySelector("#reroll-selected-dice");
const legacyItemsToggleButton = document.querySelector("#legacy-items-toggle");

const ITEMS_SOURCES = {
  modern: "./items.jsonl",
  legacy: "./items_old.jsonl",
};

let cardLibrary = [];
let itemLibrary = [];
let cardPools = {
  gold: [],
  silver: [],
  bronze: [],
};
let itemPools = {
  gold: [],
  silver: [],
  bronze: [],
};
let tableCards = [];
let tiedItemCards = [];
let players = [createPlayer("HOST")];
let currentPlayerIndex = 0;
let currentRound = 1;
let diceStates = [];
let selectedDice = new Set();
let cardResizeObserver = null;
let usingLegacyItems = false;

bootstrap().catch((error) => {
  console.error(error);
  statusElement.textContent = "Failed to load game data. Serve the docs folder through a web server.";
});

async function bootstrap() {
  const [cards, items] = await Promise.all([
    loadJsonLines("./cards.jsonl"),
    loadJsonLines(getCurrentItemsPath()),
  ]);
  cardLibrary = cards;
  itemLibrary = items;
  cardPools = buildCardPools(cardLibrary);
  itemPools = buildItemPools(itemLibrary);
  setupGrid();
  setupItemButtons();
  setupDiceControls();
  setupLegacyItemsToggle();
  setupViewportSync();
  fillTable();
  renderTable();
  statusElement.textContent = `Round ${currentRound}. Current player: ${getCurrentPlayer().name}. Click a cost card to collect its tied item and reroll both.`;
}

function getCurrentItemsPath() {
  return usingLegacyItems ? ITEMS_SOURCES.legacy : ITEMS_SOURCES.modern;
}

function getCurrentItemsLabel() {
  return usingLegacyItems ? "docs/items_old.jsonl" : "docs/items.jsonl";
}

async function loadJsonLines(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status})`);
  }

  const rawText = await response.text();
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function setupGrid() {
  gridElement.replaceChildren();
}

function setupItemButtons() {
  itemButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tier = button.dataset.itemTier;
      const tierLabel = tier ? `${tier[0].toUpperCase()}${tier.slice(1)}` : "Selected";
      if (!tier || !itemPools[tier]?.length) {
        statusElement.textContent = `${tierLabel} item deck is empty. Add item cards to ${getCurrentItemsLabel()}.`;
        return;
      }

      const itemCard = randomItem(tier);
      if (!itemCard) {
        statusElement.textContent = `${tierLabel} item deck is empty. Add item cards to ${getCurrentItemsLabel()}.`;
        return;
      }

      const emptyIndex = placeItemInPlayerSlots(itemCard);
      if (emptyIndex === -1) {
        statusElement.textContent = `${getCurrentPlayer().name}'s item slots are full.`;
        return;
      }

      renderTable();
      statusElement.textContent = `Added ${itemCard.name} to ${getCurrentPlayer().name} slot ${emptyIndex + 1}.`;
    });
  });
}

function setupLegacyItemsToggle() {
  if (!legacyItemsToggleButton) {
    return;
  }

  legacyItemsToggleButton.addEventListener("click", async () => {
    if (usingLegacyItems) {
      statusElement.textContent = "Legacy items are already enabled.";
      return;
    }

    legacyItemsToggleButton.disabled = true;
    statusElement.textContent = "Loading legacy items and restarting table...";

    try {
      usingLegacyItems = true;
      const items = await loadJsonLines(getCurrentItemsPath());
      itemLibrary = items;
      itemPools = buildItemPools(itemLibrary);
      fillTable();
      renderTable();
      legacyItemsToggleButton.textContent = "Legacy items enabled";
      statusElement.textContent = `Legacy items enabled from ${getCurrentItemsLabel()}. Table restarted.`;
    } catch (error) {
      usingLegacyItems = false;
      legacyItemsToggleButton.disabled = false;
      legacyItemsToggleButton.textContent = "Enable legacy items";
      console.error(error);
      statusElement.textContent = "Failed to enable legacy items.";
      return;
    }
  });
}

function fillTable() {
  tableCards = ROW_TIERS.flatMap((tier) =>
    Array.from({ length: CARDS_PER_ROW }, () => ({
      tier,
      card: randomCard(tier),
    })),
  );
  players = [createPlayer("HOST")];
  currentPlayerIndex = 0;
  currentRound = 1;
  tiedItemCards = tableCards.map((slot) => randomItem(slot.tier));
  diceStates = Array.from({ length: DICE_COUNT }, () => randomDieState());
  selectedDice = new Set();
  renderDice();
}

function buildCardPools(cards) {
  const pools = {
    gold: [],
    silver: [],
    bronze: [],
  };

  cards.forEach((card) => {
    if (card.card_star in pools) {
      pools[card.card_star].push(card);
    }
  });

  ROW_TIERS.forEach((tier) => {
    if (!pools[tier].length) {
      throw new Error(`No ${tier} cards available in cards.jsonl`);
    }
  });

  return pools;
}

function randomCard(tier) {
  const pool = cardPools[tier] ?? cardLibrary;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildItemPools(items) {
  const pools = {
    gold: [],
    silver: [],
    bronze: [],
  };

  items.forEach((item) => {
    if (item.rarity in pools) {
      pools[item.rarity].push(item);
    }
  });

  return pools;
}

function randomItem(tier) {
  const pool = itemPools[tier] ?? [];
  if (!pool.length) {
    return null;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomDieState() {
  return DICE_STATES[Math.floor(Math.random() * DICE_STATES.length)];
}

function renderTable() {
  ensureResizeObserver();
  cardResizeObserver.disconnect();
  gridElement.replaceChildren();
  const tableGrid = document.createElement("div");
  tableGrid.className = "table-grid";

  ROW_TIERS.forEach((_, rowIndex) => {
    const leftCardIndex = rowIndex * CARDS_PER_ROW;
    const rightCardIndex = leftCardIndex + 1;

    tableGrid.append(
      createItemSlot(tiedItemCards[leftCardIndex], {
        context: "table",
        linkedCardIndex: leftCardIndex,
      }),
      createCardCell(leftCardIndex),
      createCardCell(rightCardIndex),
      createItemSlot(tiedItemCards[rightCardIndex], {
        context: "table",
        linkedCardIndex: rightCardIndex,
      }),
    );
  });

  const playerBar = createPlayerBar();

  const playerGrid = document.createElement("div");
  playerGrid.className = "player-item-grid";
  getCurrentPlayerItems().forEach((itemCard, index) => {
    playerGrid.append(
      createItemSlot(itemCard, {
        context: "player",
        playerSlotIndex: index,
      }),
    );
  });

  gridElement.append(tableGrid, playerBar, playerGrid);
  renderPlayersList();
  renderPlayerTokens();
}

function resolveCostCard(index) {
  const previous = tableCards[index];
  const tiedItem = tiedItemCards[index];
  let collectedMessage = "No tied item was available.";

  if (tiedItem) {
    const playerSlot = placeItemInPlayerSlots(tiedItem);
    if (playerSlot === -1) {
      statusElement.textContent = `${getCurrentPlayer().name}'s item slots are full. Use an item slot before collecting another.`;
      return;
    }
    collectedMessage = `Collected ${tiedItem.name} into ${getCurrentPlayer().name} slot ${playerSlot + 1}.`;
  }

  tableCards[index] = {
    tier: previous.tier,
    card: randomCard(previous.tier),
  };
  tiedItemCards[index] = randomItem(previous.tier);
  renderTable();
  const newCard = tableCards[index].card.card_name;
  const newTiedItem = tiedItemCards[index]?.name ?? "none";
  statusElement.textContent = `${collectedMessage} Replaced ${previous.card.card_name} with ${newCard}. New tied item: ${newTiedItem}.`;
}

function placeItemInPlayerSlots(itemCard) {
  const playerItems = getCurrentPlayerItems();
  const emptyIndex = playerItems.findIndex((slot) => slot === null);
  if (emptyIndex === -1) {
    return -1;
  }
  playerItems[emptyIndex] = {
    item: itemCard,
    inactive: false,
  };
  return emptyIndex;
}

function createPlayerBar() {
  const bar = document.createElement("div");
  bar.className = "player-bar";

  const name = document.createElement("p");
  name.className = "player-bar__name";
  name.textContent = `Current player: ${getCurrentPlayer().name}`;

  const round = document.createElement("p");
  round.className = "player-bar__round";
  round.textContent = `Round ${currentRound}`;

  const actions = document.createElement("div");
  actions.className = "player-bar__actions";

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "player-bar__button";
  nextButton.textContent = "Next Player";
  nextButton.addEventListener("click", () => {
    advanceToNextPlayer();
  });

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "player-bar__button";
  addButton.textContent = "Add New Player";
  addButton.addEventListener("click", () => {
    addNewPlayer();
  });

  actions.append(nextButton, addButton);
  bar.append(name, round, actions);
  return bar;
}

function advanceToNextPlayer() {
  if (!players.length) {
    return;
  }
  clearInactiveItemsForPlayer(getCurrentPlayerItems());
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  if (currentPlayerIndex === 0) {
    currentRound += 1;
  }
  renderTable();
  statusElement.textContent = `Round ${currentRound}. Turn moved to ${getCurrentPlayer().name}.`;
}

function addNewPlayer() {
  const rawName = window.prompt("Enter new player name:");
  if (rawName === null) {
    return;
  }

  const name = rawName.trim();
  if (!name) {
    statusElement.textContent = "Player name cannot be empty.";
    return;
  }

  const exists = players.some((player) => player.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    statusElement.textContent = `Player '${name}' already exists.`;
    return;
  }

  players.push(createPlayer(name));
  renderTable();
  statusElement.textContent = `Added player ${name}. Round ${currentRound}. Current player is still ${getCurrentPlayer().name}.`;
}

function createPlayer(name) {
  return {
    name,
    items: Array.from({ length: PLAYER_ITEM_SLOTS }, () => null),
    tokens: createPlayerTokenState(),
  };
}

function createPlayerTokenState() {
  return TRACKED_TOKENS.reduce((state, token) => {
    state[token.key] = 0;
    return state;
  }, {});
}

function getCurrentPlayer() {
  return players[currentPlayerIndex];
}

function getCurrentPlayerItems() {
  return getCurrentPlayer().items;
}

function clearInactiveItemsForPlayer(items) {
  items.forEach((slot) => {
    if (slot) {
      slot.inactive = false;
    }
  });
}

function renderPlayersList() {
  if (!playersListElement) {
    return;
  }

  playersListElement.replaceChildren();
  players.forEach((player, index) => {
    const entry = document.createElement("p");
    entry.className = "players-list__entry";
    if (index === currentPlayerIndex) {
      entry.classList.add("players-list__entry--current");
    }
    entry.textContent = player.name;
    playersListElement.append(entry);
  });
}

function renderPlayerTokens() {
  if (!tokensListElement) {
    return;
  }

  tokensListElement.replaceChildren();
  const currentPlayer = getCurrentPlayer();
  TRACKED_TOKENS.forEach((tokenDef) => {
    const row = document.createElement("div");
    row.className = "tokens-list__row";
    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.setAttribute("aria-label", `${tokenDef.key} token, left side minus one, right side plus one`);

    const leftHint = document.createElement("span");
    leftHint.className = "tokens-list__edge tokens-list__edge--left";
    leftHint.textContent = "-1";

    const symbol = document.createElement("span");
    symbol.className = "tokens-list__symbol";
    symbol.append(createTokenSymbol(tokenDef));

    const amount = document.createElement("span");
    amount.className = "tokens-list__amount";
    amount.textContent = String(currentPlayer.tokens[tokenDef.key] ?? 0);

    const core = document.createElement("div");
    core.className = "tokens-list__core";
    core.append(symbol, amount);

    const rightHint = document.createElement("span");
    rightHint.className = "tokens-list__edge tokens-list__edge--right";
    rightHint.textContent = "+1";

    row.addEventListener("click", (event) => {
      adjustTokenFromRowSide(row, event.clientX, tokenDef.key);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        adjustCurrentPlayerToken(tokenDef.key, -1);
      } else if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
        adjustCurrentPlayerToken(tokenDef.key, 1);
      } else {
        return;
      }
      event.preventDefault();
    });

    row.append(leftHint, core, rightHint);
    tokensListElement.append(row);
  });
}

function createTokenSymbol(tokenDef) {
  if (tokenDef.kind === "token") {
    const icon = createCostIcon({ kind: "token", value: tokenDef.value });
    icon.classList.add("tokens-list__icon");
    return icon;
  }

  const emoji = document.createElement("span");
  emoji.className = "tokens-list__emoji";
  emoji.textContent = tokenDef.emoji ?? "?";
  return emoji;
}

function adjustCurrentPlayerToken(tokenKey, delta) {
  const currentPlayer = getCurrentPlayer();
  const currentValue = Number(currentPlayer.tokens[tokenKey] ?? 0);
  const nextValue = Math.max(0, currentValue + delta);
  currentPlayer.tokens[tokenKey] = nextValue;
  renderPlayerTokens();
}

function adjustTokenFromRowSide(rowElement, pointerClientX, tokenKey) {
  const bounds = rowElement.getBoundingClientRect();
  const relativeX = pointerClientX - bounds.left;
  const isRightSide = relativeX >= bounds.width / 2;
  adjustCurrentPlayerToken(tokenKey, isRightSide ? 1 : -1);
}

function setupDiceControls() {
  rollAllDiceButton?.addEventListener("click", () => {
    rerollAllDice();
  });

  rerollSelectedDiceButton?.addEventListener("click", () => {
    rerollSelectedDice();
  });
}

function renderDice() {
  if (!diceGridElement) {
    return;
  }

  diceGridElement.replaceChildren();
  diceStates.forEach((state, index) => {
    const die = document.createElement("button");
    die.type = "button";
    die.className = "dice-cell";
    die.setAttribute("aria-label", `Die ${index + 1}: ${state}`);
    if (selectedDice.has(index)) {
      die.classList.add("dice-cell--selected");
    }

    const face = createDieFace(state);
    die.append(face);
    die.addEventListener("click", () => {
      toggleDieSelection(index);
    });
    diceGridElement.append(die);
  });
}

function createDieFace(state) {
  const face = document.createElement("span");
  face.className = "dice-face";
  const iconItem = state === "red" || state === "green" || state === "blue"
    ? { kind: "color", value: state }
    : { kind: "special", value: state };
  const icon = createCostIcon(iconItem);
  face.append(icon);
  return face;
}

function toggleDieSelection(index) {
  if (selectedDice.has(index)) {
    selectedDice.delete(index);
  } else {
    selectedDice.add(index);
  }
  renderDice();
}

function rerollAllDice() {
  diceStates = diceStates.map(() => randomDieState());
  selectedDice.clear();
  renderDice();
  statusElement.textContent = "Rolled all dice.";
}

function rerollSelectedDice() {
  if (!selectedDice.size) {
    selectedDice.clear();
    renderDice();
    statusElement.textContent = "No dice selected.";
    return;
  }

  selectedDice.forEach((index) => {
    diceStates[index] = randomDieState();
  });
  selectedDice.clear();
  renderDice();
  statusElement.textContent = "Rerolled chosen dice.";
}

function createCardCell(index) {
  const { card } = tableCards[index];
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card";
  button.setAttribute("aria-label", `Replace ${card.card_name}`);
  applyCardFrame(button, card);
  button.append(createCardTop(card), createName(card), createDescription(card), createCosts(card));
  button.addEventListener("click", () => resolveCostCard(index));
  syncCardLayout(button);
  cardResizeObserver.observe(button);
  return button;
}

function createItemSlot(itemCard, options = {}) {
  const context = options.context ?? "table";
  const slot = document.createElement("div");
  slot.className = "item-slot";
  const linkedCardName = tableCards[options.linkedCardIndex]?.card?.card_name ?? "card";
  const playerSlotLabel = Number(options.playerSlotIndex ?? 0) + 1;
  const playerItem = context === "player" ? itemCard : null;
  const displayedItem = context === "player" ? playerItem?.item ?? null : itemCard;
  const isInactive = context === "player" && Boolean(playerItem?.inactive);

  if (!displayedItem) {
    slot.classList.add("item-slot--empty");
    if (context === "table") {
      slot.setAttribute("aria-label", `Empty tied item slot next to ${linkedCardName}`);
    } else {
      slot.setAttribute("aria-label", `Empty player item slot ${playerSlotLabel}`);
    }

    const label = document.createElement("span");
    label.className = "item-slot__label";
    label.textContent = context === "table" ? "Tied Item" : "Item Slot";

    slot.append(label);
    return slot;
  }

  if (isInactive) {
    slot.classList.add("item-slot--inactive");
  }

  slot.classList.add(`item-slot--${displayedItem.rarity}`);
  if (context === "table") {
    slot.setAttribute("aria-label", `Tied item ${displayedItem.name}`);
  } else {
    slot.setAttribute("aria-label", `Player item slot ${playerSlotLabel}: ${displayedItem.name}`);
  }

  if (context === "player") {
    const toggleInactiveButton = document.createElement("button");
    toggleInactiveButton.type = "button";
    toggleInactiveButton.className = "item-slot__action-btn item-slot__action-btn--use";
    toggleInactiveButton.textContent = "🔄";
    toggleInactiveButton.setAttribute("aria-label", `Toggle inactive for ${displayedItem.name}`);
    toggleInactiveButton.addEventListener("click", () => {
      togglePlayerItemInactive(options.playerSlotIndex);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "item-slot__action-btn item-slot__action-btn--delete";
    deleteButton.textContent = "❌";
    deleteButton.setAttribute("aria-label", `Remove ${displayedItem.name}`);
    deleteButton.addEventListener("click", () => {
      removePlayerItem(options.playerSlotIndex);
    });

    slot.append(toggleInactiveButton, deleteButton);
  }

  const symbols = document.createElement("div");
  symbols.className = "item-slot__symbols";
  expandItemSymbols(displayedItem.symbols).forEach((item) => {
    symbols.append(createItemSymbolIcon(item));
  });

  const text = document.createElement("p");
  text.className = "item-slot__text";
  if (displayedItem.reward) {
    text.classList.add("item-slot__text--symbol");
    text.append(createItemRewardIcon(displayedItem.reward));
  } else {
    text.textContent = displayedItem.text ?? "";
  }

  const title = document.createElement("h2");
  title.className = "item-slot__title";
  title.textContent = displayedItem.name;

  slot.append(symbols, text, title, createItemAttachmentBar(displayedItem));
  return slot;
}

function createItemAttachmentBar(item) {
  const bar = document.createElement("div");
  bar.className = "item-slot__attach-bar";
  const rawColors = item?.color ?? item?.dominant_color;
  const colors = normalizeCardColors(rawColors ?? "black");
  bar.style.background = buildCardBackground(colors);

  const arrow = document.createElement("span");
  arrow.className = "item-slot__attach-arrow";
  arrow.textContent = "▼";
  bar.append(arrow);

  return bar;
}

function togglePlayerItemInactive(slotIndex) {
  const player = getCurrentPlayer();
  const slot = player.items[slotIndex];
  if (!slot) {
    return;
  }

  slot.inactive = !slot.inactive;
  renderTable();
  statusElement.textContent = `${player.name}: ${slot.item.name} is now ${slot.inactive ? "inactive" : "active"}.`;
}

function removePlayerItem(slotIndex) {
  const player = getCurrentPlayer();
  const slot = player.items[slotIndex];
  if (!slot) {
    return;
  }

  const removedName = slot.item.name;
  player.items[slotIndex] = null;
  renderTable();
  statusElement.textContent = `${player.name}: removed ${removedName} from slot ${slotIndex + 1}.`;
}

function expandItemSymbols(rawSymbols) {
  const expanded = [];

  for (const symbol of rawSymbols ?? []) {
    if (Array.isArray(symbol)) {
      const [kind, value, count] = symbol;
      for (let i = 0; i < count; i += 1) {
        expanded.push({ kind, value });
      }
      continue;
    }

    expanded.push({ kind: "special", value: symbol });
  }

  return expanded;
}

function createItemSymbolIcon(item) {
  const icon = createCostIcon(item);
  icon.classList.add("item-symbol");
  return icon;
}

function createItemRewardIcon(rawReward) {
  const item = Array.isArray(rawReward)
    ? { kind: rawReward[0], value: rawReward[1] }
    : { kind: "special", value: rawReward };
  const icon = createCostIcon(item);
  icon.classList.add("item-reward");
  return icon;
}

function applyCardFrame(element, card) {
  const border = RARITY_BORDERS[card.card_star] ?? RARITY_BORDERS.none;
  const colors = normalizeCardColors(card.card_color);
  element.style.background = buildCardBackground(colors);
  element.style.border = `${border.width}px solid ${border.color}`;
}

function normalizeCardColors(rawCardColor) {
  let values = [];

  if (Array.isArray(rawCardColor)) {
    values = rawCardColor;
  } else if (typeof rawCardColor === "string") {
    values = rawCardColor.split(",");
  }

  const normalized = values
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean)
    .filter((value, index, source) => source.indexOf(value) === index);

  if (!normalized.length) {
    return ["black"];
  }

  return normalized;
}

function buildCardBackground(colors) {
  const [first, second] = colors;
  const firstBackground = CARD_BACKGROUNDS[first] ?? CARD_BACKGROUNDS.black;

  if (!second) {
    return firstBackground;
  }

  const secondBackground = CARD_BACKGROUNDS[second] ?? CARD_BACKGROUNDS.black;
  // Sigmoid-like split: long color plateaus on edges and a steep transition near center.
  return `linear-gradient(
    90deg,
    ${firstBackground} 0%,
    ${firstBackground} 40%,
    ${firstBackground} 47%,
    ${secondBackground} 53%,
    ${secondBackground} 60%,
    ${secondBackground} 100%
  )`;
}

function createName(card) {
  const node = document.createElement("h2");
  node.className = "card__name";
  node.textContent = card.card_name;
  return node;
}

function createCardTop(card) {
  const row = document.createElement("div");
  row.className = "card__top";

  const emoji = document.createElement("div");
  emoji.className = "card__emoji";
  emoji.textContent = card.card_emoji || "";

  const badge = createBadge(card);
  row.append(emoji, badge);
  return row;
}

function createBadge(card) {
  const wrapper = document.createElement("div");
  wrapper.className = "card__badge";

  if (Number(card.card_points) > 0) {
    const points = document.createElement("div");
    points.className = "points-badge";
    points.textContent = String(card.card_points);
    wrapper.append(points);
    return wrapper;
  }

  if (card.card_star && card.card_star !== "none") {
    const starStyle = STAR_STYLES[card.card_star];
    if (starStyle) {
      const star = document.createElement("div");
      star.className = "star-badge";
      star.style.setProperty("--star-scale", String(starStyle.scale));
      star.style.setProperty("--star-label-scale", String(starStyle.labelScale));

      const glyph = document.createElement("span");
      glyph.className = "star-badge__glyph";
      glyph.textContent = "★";
      glyph.style.color = starStyle.color;

      const label = document.createElement("span");
      label.className = "star-badge__label";
      label.textContent = starStyle.label;
      label.style.color = starStyle.labelColor;

      star.append(glyph, label);
      wrapper.append(star);
    }
  }

  return wrapper;
}

function createDescription(card) {
  const node = document.createElement("p");
  node.className = "card__text";
  node.textContent = card.card_text || "";
  if (!card.card_text) {
    node.hidden = true;
  }
  return node;
}

function createCosts(card) {
  const wrapper = document.createElement("div");
  wrapper.className = "card__costs";

  const { tokens, circles } = expandCostRows(card.card_costs);
  wrapper.dataset.maxCount = String(Math.max(tokens.length, circles.length, 1));

  // Tokens are always rendered on the top row, circles on the bottom row.
  wrapper.append(createCostRow(tokens), createCostRow(circles));

  return wrapper;
}

const COST_DISPLAY_ORDER = ["red", "green", "blue", "light", "dark", "fusion", "rainbow", "dice"];

function normalizeCostValue(value) {
  if (value === "heart") return "light";
  if (value === "star") return "dark";
  if (value === "skull") return "fusion";
  return value;
}

function compareCostItems(left, right) {
  const leftValue = normalizeCostValue(left.value);
  const rightValue = normalizeCostValue(right.value);
  const leftIndex = COST_DISPLAY_ORDER.indexOf(leftValue);
  const rightIndex = COST_DISPLAY_ORDER.indexOf(rightValue);
  const leftRank = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
  const rightRank = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  return String(leftValue).localeCompare(String(rightValue));
}

function expandCostRows(cardCosts) {
  const tokens = [];
  const circles = [];

  for (const cost of cardCosts ?? []) {
    if (Array.isArray(cost)) {
      const [kind, value, count] = cost;
      const normalizedValue = normalizeCostValue(value);
      for (let i = 0; i < count; i += 1) {
        if (kind === "color") {
          circles.push({ kind: "color", value: normalizedValue });
        } else if (kind === "token") {
          tokens.push({ kind: "token", value: normalizedValue });
        }
      }
      continue;
    }

    const normalizedValue = normalizeCostValue(cost);
    if (normalizedValue === "rainbow") {
      tokens.push({ kind: "token", value: normalizedValue });
    } else {
      circles.push({ kind: "special", value: normalizedValue });
    }
  }

  tokens.sort(compareCostItems);
  circles.sort(compareCostItems);

  return { tokens, circles };
}

function createCostRow(items) {
  const row = document.createElement("div");
  row.className = "cost-row";
  row.style.setProperty("--row-count", String(Math.max(1, Math.min(5, items.length))));

  items.forEach((item) => {
    row.append(createCostIcon(item));
  });

  return row;
}

function createCostIcon(item) {
  if (item.kind === "color") {
    const node = document.createElement("span");
    node.className = "cost-icon cost-icon--circle";
    node.style.background = COLOR_COSTS[item.value];
    return node;
  }

  if (item.kind === "token") {
    if (item.value === "rainbow") {
      const rainbowToken = document.createElement("span");
      rainbowToken.className = "cost-icon cost-icon--rainbow-token";
      return rainbowToken;
    }

    if (item.value in COLOR_COSTS) {
      const token = document.createElement("span");
      token.className = "cost-icon cost-icon--token";
      token.style.background = COLOR_COSTS[item.value];

      const inner = document.createElement("span");
      inner.className = "cost-icon__inner";
      inner.style.background = TOKEN_ACCENTS[item.value];
      token.append(inner);
      return token;
    }

    return createSpecialToken(item.value);
  }

  if (item.value === "dice") {
    const dice = document.createElement("span");
    dice.className = "cost-icon cost-icon--dice";
    dice.textContent = "🎲";
    return dice;
  }

  if (item.value === "rainbow") {
    const rainbow = document.createElement("span");
    rainbow.className = "cost-icon cost-icon--rainbow";
    return rainbow;
  }

  return createSpecialCircle(item.value);
}

function createSpecialCircle(value) {
  const data = SPECIALS[value];
  const node = document.createElement("span");
  node.className = "cost-icon cost-icon--circle";
  if (!data) {
    node.style.background = "rgba(226, 232, 240, 0.9)";
    node.style.color = "#111827";
    node.textContent = String(value ?? "?");
    return node;
  }

  node.style.background = data.fill;
  node.style.color = data.glyphColor;
  node.textContent = data.glyph;
  return node;
}

function createSpecialToken(value) {
  const data = SPECIALS[value];
  if (!data) {
    const token = document.createElement("span");
    token.className = "cost-icon cost-icon--token";
    token.style.background = "rgba(226, 232, 240, 0.9)";
    token.style.color = "#111827";
    token.textContent = String(value ?? "?");
    return token;
  }

  const token = document.createElement("span");
  token.className = "cost-icon cost-icon--token";
  token.style.background = data.fill;

  const inner = document.createElement("span");
  inner.className = "cost-icon__inner";
  inner.style.background = TOKEN_ACCENTS[value];
  inner.style.color = data.glyphColor;
  inner.textContent = data.glyph;
  token.append(inner);
  return token;
}

function ensureResizeObserver() {
  if (cardResizeObserver) {
    return;
  }

  cardResizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      syncCardLayout(entry.target);
    });
  });
}

function setupViewportSync() {
  const rerenderLayouts = () => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".card").forEach((cardElement) => {
        syncCardLayout(cardElement);
      });
    });
  };

  window.addEventListener("resize", rerenderLayouts);
  window.addEventListener("orientationchange", rerenderLayouts);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", rerenderLayouts);
  }
}

function syncCardLayout(cardElement) {
  const cardStyles = window.getComputedStyle(cardElement);
  const horizontalPadding =
    parseFloat(cardStyles.paddingLeft) + parseFloat(cardStyles.paddingRight);
  const verticalPadding =
    parseFloat(cardStyles.paddingTop) + parseFloat(cardStyles.paddingBottom);
  const cardWidth = Math.max(56, cardElement.clientWidth - horizontalPadding);
  const cardHeight = Math.max(88, cardElement.clientHeight - verticalPadding);

  const shortSide = Math.min(cardWidth, cardHeight);
  const nameBandHeight = clampNumber(cardHeight * 0.2, 14, cardHeight * 0.28);
  const cardGap = clampNumber(shortSide * 0.02, 2, 10);
  const baseTopRowHeight = clampNumber(cardHeight * 0.11, 14, cardHeight * 0.18);

  const costsNode = cardElement.querySelector(".card__costs");
  const maxSymbols = Math.max(
    1,
    Math.min(5, Number(costsNode?.dataset.maxCount ?? "1")),
  );
  const remainingHeight = Math.max(
    24,
    cardHeight - baseTopRowHeight - cardGap * 2,
  );
  let costAreaHeight = clampNumber(remainingHeight * 0.72, 24, cardHeight * 0.56);
  const costGap = clampNumber(cardGap * 0.85, 2, 8);
  let horizontalCostSize =
    (cardWidth - costGap * Math.max(0, maxSymbols - 1)) / maxSymbols;
  let verticalCostSize = (costAreaHeight - costGap) / 2;
  let costSize = clampNumber(
    Math.min(horizontalCostSize, verticalCostSize),
    8,
    Math.min(cardWidth * 0.28, cardHeight * 0.22, 84),
  );
  const iconBaseSize = clampNumber(costSize * 1.02, 10, cardWidth * 0.26);
  const topRowHeight = clampNumber(
    Math.max(baseTopRowHeight, iconBaseSize * 1.08),
    14,
    cardHeight * 0.2,
  );
  const adjustedRemainingHeight = Math.max(
    24,
    cardHeight - topRowHeight - cardGap * 2,
  );
  costAreaHeight = clampNumber(adjustedRemainingHeight * 0.72, 24, cardHeight * 0.56);
  horizontalCostSize =
    (cardWidth - costGap * Math.max(0, maxSymbols - 1)) / maxSymbols;
  verticalCostSize = (costAreaHeight - costGap) / 2;
  costSize = clampNumber(
    Math.min(horizontalCostSize, verticalCostSize),
    8,
    Math.min(cardWidth * 0.28, cardHeight * 0.22, 84),
  );
  const syncedIconSize = clampNumber(costSize * 1.02, 10, cardWidth * 0.26);
  const nameNode = cardElement.querySelector(".card__name");
  const nameFontSize = estimateNameFontSize(
    nameNode?.textContent ?? "",
    Math.max(24, cardWidth - syncedIconSize * 2 - cardGap * 3),
    nameBandHeight,
  );
  const titleSideClearance = clampNumber(
    syncedIconSize + cardGap * 1.4,
    12,
    Math.max(12, cardWidth * 0.34),
  );
  const nameTopOffset = clampNumber(cardGap * 0.35, 1, 8);

  cardElement.style.setProperty("--top-row-height", `${topRowHeight}px`);
  cardElement.style.setProperty("--name-band-height", `${nameBandHeight}px`);
  cardElement.style.setProperty("--name-top-offset", `${nameTopOffset}px`);
  cardElement.style.setProperty("--title-side-clearance", `${titleSideClearance}px`);
  cardElement.style.setProperty("--name-font-size", `${nameFontSize}px`);
  cardElement.style.setProperty("--badge-size", `${syncedIconSize}px`);
  cardElement.style.setProperty("--emoji-size", `${syncedIconSize}px`);
  cardElement.style.setProperty("--cost-area-height", `${costAreaHeight}px`);
  cardElement.style.setProperty("--cost-size", `${costSize}px`);
  cardElement.style.setProperty("--cost-gap", `${costGap}px`);
  cardElement.style.setProperty("--card-gap", `${cardGap}px`);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function estimateNameFontSize(cardName, availableWidth, availableHeight) {
  const cleanedName = cardName.trim();
  if (!cleanedName) {
    return 8;
  }

  let fontSize = clampNumber(
    Math.min(availableHeight * 0.72, availableWidth * 0.16),
    8,
    28,
  );

  while (fontSize > 8) {
    const averageCharWidth = fontSize * 0.56;
    const maxCharsPerLine = Math.max(4, Math.floor(availableWidth / averageCharWidth));
    const estimatedLines = estimateWrappedLineCount(cleanedName, maxCharsPerLine);
    const usedHeight = estimatedLines * fontSize * 1.08;

    if (usedHeight <= availableHeight * 0.96) {
      return fontSize;
    }

    fontSize -= 0.5;
  }

  return 8;
}

function estimateWrappedLineCount(text, maxCharsPerLine) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) {
    return 1;
  }

  let lines = 1;
  let lineLength = 0;

  words.forEach((word) => {
    const wordLength = word.length;

    if (lineLength === 0) {
      lineLength = wordLength;
      return;
    }

    if (lineLength + 1 + wordLength <= maxCharsPerLine) {
      lineLength += 1 + wordLength;
      return;
    }

    lines += 1;
    lineLength = wordLength;
  });

  return lines;
}
