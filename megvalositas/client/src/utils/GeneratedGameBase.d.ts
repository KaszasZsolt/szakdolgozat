/**
 * A kártya adatmodel.
 */
declare interface CardData {
    suit: string;
    rank: string;
  }
  
  /**
   * A GeneratedGameBase osztály, amely az általános funkciókat tartalmazza.
   */
  declare class GeneratedGameBase {
    /**
     * A játékot a következő játékosra lépteti a megadott irányban.
     * @param direction Az irány, amelyben a következő játékosra lépünk. Alapértelmezett: 'forward'.
     */
    nextPlayer(direction?: 'forward' | 'backward'): void;
  
    /**
     * Beállítja a használandó kártyapaklit.
     * Lehet előre definiált típus ('magyarkártya', 'pókerkártya') vagy egyéni kártyaobjektum tömb.
     * 
     * @param deck A választott pakli típusa vagy egyéni kártyák tömbje.
     * @example
     * // Előre definiált pakli: magyar kártya
     * game.setDeckType('magyarkártya');
     * 
     * // Előre definiált pakli: pókerkártya
     * game.setDeckType('pókerkártya');
     * 
     * // Egyéni pakli
     * game.setDeckType([
     *   { suit: 'fancy', rank: 'dragon' },
     *   { suit: 'fancy', rank: 'phoenix' }
     * ]);
     */
    setDeckType(deck: 'magyarkártya' | 'pókerkártya' | CardData[]): void;
  
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
    // /**
    //  * A játékos kezéből letesz egy kártyát a megadott indexről.
    //  * @param playerId A játékos azonosítója.
    //  * @param index A letendő kártya indexe a kézben.
    //  * @returns A letett kártya, vagy `null`, ha az index érvénytelen.
    //  */
    // playCard(playerId: string, index: number): CardData | null;
  
    /**
     * Átrendezi a játékos kezében lévő kártyák sorrendjét.
     * Kivágja a `fromIndex` pozíción lévő kártyát és beilleszti `toIndex` helyére.
     * @param playerId A játékos azonosítója.
     * @param fromIndex Az áthelyezendő kártya eredeti indexe.
     * @param toIndex A kártya új indexe.
     */
    reorderHand(playerId: string, fromIndex: number, toIndex: number): void;
  }
  