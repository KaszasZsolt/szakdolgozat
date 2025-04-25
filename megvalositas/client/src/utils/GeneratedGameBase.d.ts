/**
 * A kártya adatmodel.
 */
declare interface CardData {
    suit: string;
    rank: string;
  }

/**
 * A játék motor interfész.
 */
declare interface GameEngine {
    // Define the properties and methods of GameEngine here
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
     * // Előre definiált pakli: magyar kártya
     * game.setDeckType('magyarkártya');
     * 
     * // Előre definiált pakli: franciakártya
     * game.setDeckType('franciakártya');
     * 
     * // Egyéni pakli
     * game.setDeckType([
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
     * A játékos kezéből letesz egy kártyát a megadott indexről.
     * @param playerId A játékos azonosítója.
     * @param index A letendő kártya indexe a kézben.
     * @returns A letett kártya, vagy `null`, ha az index érvénytelen.
     */
    playCard(playerId: string, index: number): CardData | null;
  
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
   */
  drawFromPile(): CardData | null;

  /**
   * Visszaadja a húzópakli másolatát.
   */
  getDrawPile(): CardData[];

  /**
   * Beállítja az asztalon lévő kezdőlapot.
   * Ha nincs megadva, a pakli első lapját használja.
   * @param card (opcionális) A kezdőlap.
   */
  setTableCard(card?: CardData): void;

  /**
   * Lekérdezi az asztalon lévő kezdőlapot.
   * @returns A kezdőlap vagy `null`, ha még nincs lerakva.
   */
  getTableCard(): CardData | null;

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
   * // Minden 2-es lapnál
   * registerCardEffect("2", (card) => {
   *   console.log(`Player ${playerId} 2-est dobott – következő játékos 2-t húz!`);
   *   super.nextPlayer();
   *   const next = super.getCurrentPlayer();
   *   super.dealCards(2);
   * });
   * 
   * // Minden piros színű lapnál (magyarkártya: 'piros')
   * registerCardEffect("piros", (card) => {
   *   console.log(`Piros lap dobva: ${card.rank} – extra kör!`);
   *   // Például: újra dobhat
   * });
   * 
   * // Minden ♠ ásznál
   * registerCardEffect("♠_A", (card) => {
   *   console.log(`Fekete ász! Színválasztás indul.`);
   *   super.chooseColor();
   * });
   * 
   * // Magyar kártya: makk alsó (specialitás)
   * registerCardEffect("makk_alsó", (card) => {
   *   console.log(`Makk alsó dobva – mindenki új lapot húz!`);
   *   for (const p of super.getPlayers()) {
   *     super.dealCards(1,p.id);
   *   }
   * });
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
   * const card = game.drawFromPile();
   * if (card) {
   *   game.giveCardToPlayer(card); // Jelenlegi játékos kapja
   * }
   *
   * @example
   * const card = { suit: '♠', rank: 'A' };
   * game.giveCardToPlayer(card, "player1"); // Konkrét játékos kapja
   */
  giveCardToPlayer(card: CardData, playerId?: string): void;

  /**
   * Visszaadja az aktuális játékost (aki éppen soron van).
   * 
   * @returns Az aktuális játékos objektuma.
   */
  getCurrentPlayer(): any;

  /**
   * Általános célú választáskérés a játékostól.
   * Küldesz neki egy listát (pl. a kézben lévő lapokat), és megadhatsz egy függvényt,
   * ami a választás után lefut a választott elem alapján.
   *
   * @param options A választható opciók tömbje (pl. kártyák, számok, szövegek).
   * @param onSelected Callback, ami megkapja a kiválasztott opció értékét és indexét.
   * @param timeoutMs (opcionális) időkorlát ezredmásodpercben.
   *
   * @example
   * const hand = super.getHand();
   * await super.waitForSelection(hand, (selected, index) => {
   *   if (selected && index !== null) {
   *     super.playCard(super.getCurrentPlayer().id, index);
   *   }
   * });
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
   * const remaining = game.getDeck();
   * console.log(`Még ${remaining.length} lap van a pakliban.`);
   */
    getDeck(): CardData[];
}
  