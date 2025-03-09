export const baseFunctions = {
    shuffleDeck: {
      func: () => {
        console.log("A pakli megkeverése...");
      },
      description: "Megkeveri a kártyapaklit.",
    },
  
    drawCard: {
      func: () => {
        console.log("Kártya húzása...");
      },
      description: "Egy új kártyát húz a pakliból.",
    },
  
    playCard: {
      func: () => {
        console.log("Lap kijátszása...");
      },
      description: "Kijátszik egy lapot a kézből.",
    },
  
    selectDeckType: {
      func: () => {
        console.log("Kártyatípusok beállítása...");
      },
      description: "Beállítja a játékban használt kártyatípusokat.",
    },
  
    setCardCount: {
      func: () => {
        console.log("Kártyák száma beállítása...");
      },
      description: "Megadja a játék során használható kártyák számát.",
    },
  
    setupPlayers: {
      func: () => {
        console.log("Játékosok listájának beállítása...");
      },
      description: "Hozzáadja a játékosokat a játékhoz.",
    },
  
    chooseStartingPlayer: {
      func: () => {
        console.log("Kezdő játékos kiválasztása...");
      },
      description: "Megállapítja, hogy ki kezdi a játékot.",
    },
  
    setInitialCards: {
      func: () => {
        console.log("Kiosztandó lapok száma...");
      },
      description: "Meghatározza a kezdő lapok számát.",
    },
  
    configureRules: {
      func: () => {
        console.log("Szabályok beállítása...");
      },
      description: "Beállítja a játék egyedi szabályait.",
    },
  
    placeStartingCard: {
      func: () => {
        console.log("Kezdő lap lerakása...");
      },
      description: "Lerakja az első lapot a játék kezdetekor.",
    },
  
    playMatchingCard: {
      func: () => {
        console.log("Megfelelő lap lerakása...");
      },
      description: "Ellenőrzi és lerakja a megfelelő lapot.",
    },
  
    handleSpecialCards: {
      func: () => {
        console.log("Különleges lapok kezelése...");
      },
      description: "Kezeli a speciális lapok hatásait.",
    },
  
    declareMacao: {
      func: () => {
        console.log('"Makaó" bemondása...');
      },
      description: "A játékos bemondja a 'Makaó' szót, ha az utolsó lapja van.",
    },
  
    penaltyDraw: {
      func: () => {
        console.log("Büntető lap húzása...");
      },
      description: "Büntetőkártyát húzat a játékossal.",
    },
  
    calculateScores: {
      func: () => {
        console.log("Pontszámok kiszámítása...");
      },
      description: "Összegzi a játékosok pontszámait.",
    },
  
    sumRemainingCards: {
      func: () => {
        console.log("Kézben maradt lapok összegzése...");
      },
      description: "Összesíti a játékosoknál maradt kártyákat.",
    },
  
    determineWinner: {
      func: () => {
        console.log("10 osztás után győztes megállapítása...");
      },
      description: "Meghatározza a végső győztest a játék végén.",
    },
  };
  