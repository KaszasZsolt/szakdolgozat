class GameCreator {
    constructor(gameName) {
        this.gameName = gameName;
        this.states = {};
    }

    addState(stateName, actions, next) {
        this.states[stateName] = { actions, next };
    }

    generateGameStructure() {
        return {
            game: this.gameName,
            states: this.states
        };
    }

    createFunction(name, code = "console.log('Action executed: " + name + "');") {
        this[name] = new Function(code);
    }
}

const game = new GameCreator("Makaó");

game.addState("Setup", [
    { name: "Kártyatípusok beállítása", code: "selectDeckType();" },
    { name: "Kártyák száma beállítása", code: "setCardCount();" },
    { name: "Játékosok listája", code: "setupPlayers();" },
    { name: "Kezdő játékos kiválasztása", code: "chooseStartingPlayer();" },
    { name: "Kiosztandó lapok száma", code: "setInitialCards();" },
    { name: "Szabályok beállítása", code: "configureRules();" }
], "Jatekmenet");

game.addState("Jatekmenet", [
    { name: "Kezdő lap lerakása", code: "placeStartingCard();" }
], "JatekKor");

game.addState("JatekKor", [
    { name: "Laphúzás", code: "drawCard();" },
    { name: "Megfelelő lap lerakása", code: "playMatchingCard();" },
    { name: "Különleges lapok kezelése", code: "handleSpecialCards();" },
    { name: "\"Makaó\" bemondása", code: "declareMacao();" },
    { name: "Büntető lap húzása", code: "penaltyDraw();" }
], "JatekVege");

game.addState("JatekVege", [
    { name: "Pontszámok kiszámítása", code: "calculateScores();" },
    { name: "Kézben maradt lapok összegzése", code: "sumRemainingCards();" },
    { name: "10 osztás után győztes megállapítása", code: "determineWinner();" }
], null);

console.log(game.generateGameStructure());
