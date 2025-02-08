function generateMermaid(jsonData) {
    let diagram = "stateDiagram-v2\n    [*] --> Setup\n";
    
    for (const [state, details] of Object.entries(jsonData.states)) {
        diagram += `    state ${state} {\n`;
        if (details.actions && details.actions.length > 0) {
            details.actions.forEach(action => {
                diagram += `        ${state} : ${action.name}\n`;
            });
        }
        if (details.next) {
            if (Array.isArray(details.next)) {
                details.next.forEach(nextState => {
                    diagram += `    ${state} --> ${nextState}\n`;
                });
            } else {
                diagram += `    ${state} --> ${details.next}\n`;
            }
        }
        diagram += `    }\n`;
    }
    
    return diagram;
}

const jsonConfig = {
    "game": "Makaó",
    "states": {
        "Setup": {
            "actions": [
                {"name": "Kártyatípusok beállítása", "code": "selectDeckType();"},
                {"name": "Kártyák száma beállítása", "code": "setCardCount();"},
                {"name": "Játékosok listája", "code": "setupPlayers();"},
                {"name": "Kezdő játékos kiválasztása", "code": "chooseStartingPlayer();"},
                {"name": "Kiosztandó lapok száma", "code": "setInitialCards();"},
                {"name": "Szabályok beállítása", "code": "configureRules();"}
            ],
            "next": "Jatekmenet"
        },
        "Jatekmenet": {
            "actions": [
                {"name": "Kezdő lap lerakása", "code": "placeStartingCard();"}
            ],
            "next": "JatekKor"
        },
        "JatekKor": {
            "actions": [
                {"name": "Laphúzás", "code": "drawCard();"},
                {"name": "Megfelelő lap lerakása", "code": "playMatchingCard();"},
                {"name": "Különleges lapok kezelése", "code": "handleSpecialCards();"},
                {"name": "\"Makaó\" bemondása", "code": "declareMacao();"},
                {"name": "Büntető lap húzása", "code": "penaltyDraw();"}
            ],
            "next": "JatekVege"
        },
        "JatekVege": {
            "actions": [
                {"name": "Pontszámok kiszámítása", "code": "calculateScores();"},
                {"name": "Kézben maradt lapok összegzése", "code": "sumRemainingCards();"},
                {"name": "10 osztás után győztes megállapítása", "code": "determineWinner();"}
            ],
            "next": null
        }
    }
};

const mermaidCode = generateMermaid(jsonConfig);
console.log(mermaidCode);

function selectDeckType() { console.log("Selecting deck type..."); }
function setCardCount() { console.log("Setting card count..."); }
function setupPlayers() { console.log("Setting up players..."); }
function chooseStartingPlayer() { console.log("Choosing starting player..."); }
function setInitialCards() { console.log("Setting initial cards..."); }
function configureRules() { console.log("Configuring rules..."); }
function placeStartingCard() { console.log("Placing starting card..."); }
function drawCard() { console.log("Drawing a card..."); }
function playMatchingCard() { console.log("Playing a matching card..."); }
function handleSpecialCards() { console.log("Handling special cards..."); }
function declareMacao() { console.log("Declaring Macao!"); }
function penaltyDraw() { console.log("Drawing penalty cards..."); }
function calculateScores() { console.log("Calculating scores..."); }
function sumRemainingCards() { console.log("Summing remaining cards..."); }
function determineWinner() { console.log("Determining the winner..."); }
