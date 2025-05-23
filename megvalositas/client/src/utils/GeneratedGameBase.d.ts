/**
 * A kártya adatmodel.
 */
declare interface CardData {
    suit: string;
    rank: string;
  }

declare type TableMode = "stack" | "spread" | "hidden";
/**
 * A játék motor interfész.
 */
declare interface GameEngine {
    // GameEngine metódusok
}

  /**
   * A GeneratedGameBase osztály, amely az általános funkciókat tartalmazza.
   */
  declare class GeneratedGameBase {

    engine: GameEngine | null;
    /**
     * A játékot a következő játékosra lépteti a megadott irányban.
     * @param direction Az irány, amelyben a következő játékosra lépünk. Alapértelmezett: 'forward'.
     */
    nextPlayer(direction?: 'forward' | 'backward'): void;
  
    /**
     * Beállítja a használandó kártyapaklit.
     * Lehet előre definiált típus ('magyarkártya', 'franciakártya') vagy egyéni kártyaobjektum tömb.
     * 
     * @param deck A választott pakli típusa vagy egyéni kártyák tömbje.
     * @example
     * Előre definiált pakli: magyar kártya
     * super.setDeckType('magyarkártya');
     * 
     * Előre definiált pakli: franciakártya
     * super.setDeckType('franciakártya');
     * 
     * Egyéni pakli
     * super.setDeckType([
     *   { suit: 'fancy', rank: 'dragon' },
     *   { suit: 'fancy', rank: 'phoenix' }
     * ]);
     */
    setDeckType(deck: 'magyarkártya' | 'franciakártya' | CardData[]): void;
  
    /**
     * Beállítja, hogy egy játékosnál maximum hány lap lehet kézben.
     * @param size A kézben tartható maximális lapok száma.
     */
    setMaxHandSize(size: number): void;
  
    /**
     * Kioszt a megadott játékosnak `count` kártyát (legfeljebb a beállított max méretig).
     * @param playerId A játékos azonosítója.
     * @param count A kiosztandó kártyák száma.
     */
    dealCards(playerId: string, count: number): void;
  
    /**
     * Kioszt `count` lapot a jelenlegi játékosnak (legfeljebb a beállított max kézméretig).
     * @param count A kiosztandó kártyák száma.
     */
    dealToCurrent(count: number): void;

     /**
     * Kioszt `count` lapot minden regisztrált játékosnak (legfeljebb a beállított max kézméretig).
     * @param count A kiosztandó kártyák száma.
     */
    dealToAll(count: number): void;

  /**
   * A játékos kezéből letesz egy konkrét kártyát.
   * Az első egyező kártyát távolítja el a játékos kezéből.
   *
   * @param playerId A játékos azonosítója, akinek a kezéből a kártyát le szeretnénk tenni.
   * @param card A kártya, amelyet le szeretnénk tenni. A keresés a suit + rank alapján történik.
   * @returns A ténylegesen letett kártya, ha megtalálható volt a kézben; `null`, ha nem volt ilyen kártya.
   *
   * @example
   * const card = { suit: 'piros', rank: 'VII' };
   * const result = engine.playCard('player1', card);
   * if (result) {
   *   console.log('Sikeresen letett kártya:', result);
   * } else {
   *   console.log('A kártya nem volt a játékos kezében.');
   * }
   */
   playCard(playerId: string, card: CardData): CardData | null | Promise<CardData | null>;
  
  /**
   * Eltávolít egy adott kártyát a megadott játékos kezéből.
   * Az első találatot távolítja el a kézben lévő azonos kártyák közül.
   *
   * @param playerId A játékos azonosítója. 
   * @param card A kártya, amit el kell távolítani.
   * @returns `true`, ha a kártyát sikerült eltávolítani, `false`, ha nem volt megtalálható.
   * @example const playerId = this.getCurrentPlayer().id;
   * const hand = super.getHand();
   * const card = hand[0];
   * super.removeCardFromPlayerHand(playerId, card);
   * 
   */
  removeCardFromPlayerHand(playerId: string, card: CardData): boolean;


    /**
     * Átrendezi a játékos kezében lévő kártyák sorrendjét.
     * Kivágja a `fromIndex` pozíción lévő kártyát és beilleszti `toIndex` helyére.
     * @param playerId A játékos azonosítója.
     * @param fromIndex Az áthelyezendő kártya eredeti indexe.
     * @param toIndex A kártya új indexe.
     */
    reorderHand(playerId: string, fromIndex: number, toIndex: number): void;
    
  /**
   * Beállítja a húzópaklit az asztalon.
   * @param cards A húzópakli lapjai.
   * @example
   * super.setDrawPile(super.getDeck())
   */
  setDrawPile(cards: CardData[]): void;

  /**
   * Egy új lapot hozzáad a húzópakli végéhez.
   * @param card A hozzáadandó lap.
   */
  addToDrawPile(card: CardData): void;

  /**
   * Egy lapot húz a húzópakli tetejéről.
   * @returns A húzott lap, vagy `null`, ha a pakli üres.
   * @example
   * const card=super.drawFromPile()
   * if (card) {
   *  super.giveCardToPlayer(card)
   * }
   */
  drawFromPile(): CardData | null;
  
    /**
   * A pakli megkeverése Fisher–Yates algoritmussal.
   * A kártyák sorrendjét véletlenszerűen változtatja.
   * @returns void
   */
    shuffleDeck(): void;

  /**
   * Visszaadja a húzópakli másolatát.
   */
  getDrawPile(): CardData[];

  /**
   * Beállítja az asztalon lévő kártyákat.
   * Ha nincs megadva, a pakli első lapjával tölti fel.
   * @param cards (opcionális) A beállítandó kártyák tömbje.
   */
    setTableCards(cards?: CardData[]): void;

    /**
     * Hozzáad egy új kártyát az asztalon lévő lapokhoz.
     * @param card A hozzáadandó kártya.
     * @example
     * const card = super.drawFromPile();
     * super.addTableCard(card);
     */
    addTableCard(card: CardData): void;

    /**
     * Lekérdezi az asztalon lévő összes kártyát.
     * @returns Az asztalon lévő kártyák tömbje.
     */
    getTableCards(): CardData[];

    /**
     * Törli az asztalon lévő összes kártyát.
     */
    clearTableCards(): void;


  /**
   * Felregisztrál egy kártya hatást a megadott kártyára.
   * A `key` lehet:
   *  - csak érték (pl. `"2"`): minden 2-es lapra vonatkozik, függetlenül a színtől
   *  - csak szín (pl. `"♠"` vagy `"zöld"`): minden adott színű lapra vonatkozik, függetlenül az értéktől
   *  - csak suit+rank (pl. `"♠_A"` vagy `"piros_X"`): csak konkrét szín + érték esetén fut le
   *  - egyedi szintaxis, amit a fejlesztő használ (pl. `"joker"`) – ha olyan lap is van
   * 
   * Példák:
   * ```ts
   * 
   * // Minden piros színű lapnál (magyarkártya: 'piros')
   * registerCardEffect("piros", (card) => {
   *   console.log(`Piros lap dobva: ${card.rank} – extra kör!`);
   *   // Például: újra dobhat
   * });
   * 
   * // Minden ♠ ásznál
   * super.registerCardEffect('A', async () => {
   * const suits = ['♠', '♥', '♦', '♣'];
   * await super.waitForSelection<string>(
   *  suits,
   *  (selected, idx) => {
   *    if (selected) {
   *      // store the player’s choice
   *      this.currentRequestedSuit = selected;
   *    }
   *  },
   *  10000
   * );
   * console.log("választani kellene")
   * });
   * 
   * // Magyar kártya: makk alsó (specialitás)
   * ```
   * 
   * @param key A kártyához kapcsolódó hatás azonosítója. Például `"2"`, `"♠_A"`, `"zöld"`, `"makk_alsó"`
   * @param handler A függvény, ami akkor fut le, ha a játékos ilyen lapot játszik ki.
   */
  registerCardEffect(key: string, handler: (card: CardData) => void): void;


  /**
   * Visszaadja minden játékos kézben lévő lapjait.
   * Broadcastolja is a változásokat a "handsUpdate" eseményen.
   */
  getHands(): Record<string, CardData[]>;

  /**
   * Visszaadja egyetlen játékos kezében lévő lapokat.
   * Ha nincs megadva playerId, akkor az aktuális játékos kezét adja vissza.
   * @param playerId (opcionális) A játékos azonosítója.
   */
  getHand(playerId?: string): CardData[];

    /**
   * Egy meglévő kártyát ad hozzá egy játékos kezéhez.
   * Ha nincs megadva playerId, akkor az aktuális játékos kapja meg a lapot.
   *
   * @param card A hozzáadandó lap.
   * @param playerId (opcionális) A játékos azonosítója.
   *
   * @example
   * const card = super.drawFromPile();
   * if (card) {
   *   super.giveCardToPlayer(card); // Jelenlegi játékos kapja
   * }
   *
   * const card = super.drawFromPile();
   * super.giveCardToPlayer(card, this.getCurrentPlayer().id) // Megadott játékos kapja
   * 
   */
  giveCardToPlayer(card: CardData, playerId?: string): void;

  /**
   * Visszaadja az aktuális játékost (aki éppen soron van).
   * 
   * @returns Az aktuális játékos objektuma.
   */
  getCurrentPlayer():  { id: string;email: string,[key: string]: unknown};

  /**
   * Általános célú választáskérés a játékostól.
   * Küldesz neki egy listát (pl. a kézben lévő lapokat), és megadhatsz egy függvényt,
   * ami a választás után lefut a választott elem alapján.
   *
   * @param options A választható opciók tömbje (pl. kártyák, számok, szövegek).
   * @param onSelected Callback, ami megkapja a kiválasztott opció értékét és indexét.
   * @param timeoutMs (opcionális) időkorlát ezredmásodpercben.
   *
   * 
   * @example
   *  const hand = super.getHand();
   *  const playable = hand
   *    .filter(c => this.isPlayable(c, super.getTableTop()!))
   *    .map(c => JSON.stringify(c))
   *    .concat("Húz");
   *
   *  await super.waitForSelection<string>(
   *    playable,
   *    async (sel, idx) => {
   *      if (sel === "Húz" || !sel) {
   *        const c = super.drawFromPile();
   *        if (c) super.giveCardToPlayer(c, playerId);
   *        console.log("Húzás választva");
   *      } else {
   *        const card = JSON.parse(sel) as CardData;
   *        await super.playCard(playerId, card);
   *        super.removeCardFromPlayerHand(playerId, card);
   *        super.addTableCard(card);
   *      }
   *      this.advanceTurn();
   *    },
   *    20000
   *  );
   * 
   * 
   *  const suits = ['♠', '♥', '♦', '♣'];
   * await super.waitForSelection<string>(
   *   suits,
   *  (selected, idx) => {
   *    if (selected) {
   *      // store the player’s choice
   *      this.currentRequestedSuit = selected;
   *    }
   *  },
   *  10000
   * );
   */
  waitForSelection<T>(
    options: T[],
    onSelected: (selected: T | null, index: number | null) => void,
    timeoutMs?: number
  ): Promise<void>;

    /**
   * Visszaadja a pakli aktuális állapotát, azaz a még kiosztható lapokat.
   * Nem tartalmazza a játékosok kezében lévő lapokat vagy az asztalon lévő kezdőlapot.
   *
   * @returns A pakliban lévő kártyák tömbje.
   *
   * @example
   * const remaining = super.getDeck();
   * console.log(`Még ${remaining.length} lap van a pakliban.`);
   */
    getDeck(): CardData[];



    /**
   * Megmondja, hogy az aktuális játékos (vagy megadott játékos) választott-e már ebben a körben.
   * 
   * @param playerId (opcionális) A játékos azonosítója. Ha nincs megadva, az aktuális játékosra néz.
   * @returns `true`, ha már választott, `false`, ha még nem, `null`, ha nem található a játékos.
   *
   * @example
   * if (super.hasPlayerChosen()) {
   *   console.log("A játékos már választott.");
   * } else {
   *   console.log("Még nem választott.");
   * }
   */
  hasPlayerChosen(playerId?: string): boolean | null;

  /**
   * Visszaadja a tábla tetején (legutóbb lerakott) kártyát.
   * Ha nincs egyetlen lap sem az asztalon, undefined‐ot ad vissza.
   */
   getTableTop(): CardData | undefined ;


  /**
   * Beállítja a tábla kártyáinak megjelenítési módját.
   * A módok: "stack" (egymásra rakva), "spread" (szétszórva), "hidden" (rejtett).
   *
   * @param mode A megjelenítési mód ("stack", "spread", "hidden").
   * @example
   * super.setTableCardMode("spread");
   * */
   setTableCardMode(mode: TableMode): void;

    /**
  * Értesítés küldése.
  * @param message    – fő szöveg
  * @param description? – opcionális részletes leírás
  * @param playerId?  – ha megadod, csak neki jelenik meg; különben mindenkinek
  */
    notify(message: string, description?: string, playerId?: string): void;

    /**
    * A játékhoz csatlakozott játékosok listájának lekérése.
    * @returns {any[]} – az aktuálisan csatlakozott játékosokat tartalmazó tömb. Minden elem egy
    *                     { id: string; email: string; … } objektum. Ha az engine még nincs inicializálva,
    *                     üres tömböt ad vissza.
    */
    public getPlayers(): any[];
}
  