
# Kártyajáték készítő

## **Időbeosztás**  

| **Mérföldkő száma** | **Időszak**                 | **Feladatok / Mérföldkövek**                                                                                                                                                  |
|----------------------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1. mérföldkő** | **2024.02.10 -ig**  | **Papíralapú tervezés és alap struktúra megtervezése**<br> - Papíron két játék levezetése.<br> - Állapotgép példák készítése.<br> - Időbeosztás véglegesítése.<br> - Repository létrehozása.<br> - README elkészítése. |
| **2. mérföldkő** | **2024.02.11–02.17. (7. hét)** | **Frontend és Backend alapok egyidejű megvalósítása**<br> - **Frontend**: Regisztráció és bejelentkezés UI (React, formázás, navigáció).<br> - **Backend**: Felhasználói fiókok kezelése, MySQL adatbázis beállítása. |
| **3. mérföldkő** | **2024.02.18–02.24. (8. hét)** | **Játék létrehozásának felülete – vizuális szerkesztő + Backend API alapok**<br> - **Frontend**: Játék létrehozó UI első verziója, komponensek mozgatása, szerkesztése.<br> - **Backend**: API-k a játékok tárolására és lekérésére. |
| **4. mérföldkő** | **2024.02.25–03.02. (9. hét)** | **Vizuális szerkesztő bővítése + Backend fejlesztés folytatása**<br> - **Frontend**: Kód szerkesztése és hozzáadása frontendről, állapotok és akciók módosítása UI-n.<br> - **Backend**: Játékok tárolása adatbázisban, API kiterjesztése. |
| **5. mérföldkő** | **2024.03.03–03.09. (10. hét)** | **Játékok mentése és betöltése + Frontend és Backend összekapcsolása**<br> - **Frontend**: A játékok mentésének és betöltésének frontend oldali megvalósítása.<br> - **Backend**: Játékadatok validálása és biztonságos tárolása. |
| **6. mérföldkő** | **2024.03.10–03.16. (11. hét)** | **Backend továbbfejlesztése – Állapotgépek és szabályok kezelése**<br> - **Frontend**: UI továbbfejlesztése a szabályok kezelésére.<br> - **Backend**: Állapotgépek működésének implementálása és API kapcsolat létrehozása. |
| **7. mérföldkő** | **2024.03.17–03.23. (12. hét)** | **Játékok kezelése és adminisztrációs funkciók**<br> - **Frontend**: Mentett játékok listázása, szerkesztése, törlése UI-n.<br> - **Backend**: Jogosultságok kezelése a mentett játékokhoz. |
| **8. mérföldkő** | **2024.03.24–03.31. (13. hét)** | **Szobák létrehozása és többjátékos rendszer kialakítása**<br> - **Frontend**: UI szobakezeléshez és csatlakozáshoz.<br> - **Backend**: Szobák és játékszabályok API implementálása. |
| **9. mérföldkő** | **2024.04.01–04.07. (14. hét)** | **Játékmenet és interakciók finomhangolása**<br> - **Frontend**: Játék UI véglegesítése, animációk és interaktív elemek hozzáadása.<br> - **Backend**: Szobák közötti kommunikáció és valós idejű frissítések. |
| **10. mérföldkő** | **2024.04.08–04.14. (15. hét)** | **Tesztek és hibajavítás**<br> - **Frontend**: Felhasználói tesztelés és UI hibajavítás.<br> - **Backend**: Biztonsági és teljesítménytesztek. |
| **11. mérföldkő** | **2024.04.15–04.25. (16–17. hét)** | **Dokumentáció elkészítése és rendszer véglegesítése**<br> - Kódrészletek és ábrák hozzáadása.<br> - Végső hibajavítások és optimalizálás. |
| **12. mérföldkő** | **2024.04.26.**               | **Dolgozat leadása**  |

---


## Bejelentkezés, regisztráció lehetősége
A regisztrált felhasználó tudjon létrehozni játékot

## Játék Létrehozó

A játék létrehozója lehetővé teszi egy játék létrehozását egy meghatározott alap szerkezettel.

## Játék Alapstruktúra

```javascript
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
```
## Példa mermaid (https://mermaid.live/)    
    stateDiagram-v2
    [*] --> Setup

    state Setup {
      [*] --> Konfiguracio
      Konfiguracio : Kártyatípusok beállítása
      Konfiguracio : Kártyák száma beállítása
      Konfiguracio : Játékosok listája
      Konfiguracio : Kezdő játékos kiválasztása
      Konfiguracio : Kiosztandó lapok száma
      Konfiguracio : Szabályok beállítása
      Konfiguracio --> SetupKesz : Beállítások kész
      SetupKesz --> [*]
    }

    Setup --> Jatekmenet : Setup befejezve

    state Jatekmenet {
      [*] --> ElsoKor
      ElsoKor : Saját párkártyák lerakása
      ElsoKor --> JatekKor : Első kör vége

      state JatekKor {
         [*] --> KorAktivalas
         KorAktivalas : Laphúzás, párkártyák ellenőrzése, azonos párkártyák lerakása
         KorAktivalas --> KorVege : Játék vége állapot ellenőrzése
         KorVege --> [*]
      }

      JatekKor --> JatekVege : Ha játék vége feltétel teljesül

      JatekVege --> Kiertekeles : Joker maradt vesztett, legtöbb párt nyert
      Kiertekeles --> [*]
    }

    Jatekmenet --> [*]


## Publikus és privát játékok lehetősége
A készítő eldönthesse, hogy az általa készített játékkal mások is játszhassanak.

## Osztály Alapú Megvalósítás
A funkciókat, amelyeket létrehoz a készítő, automatikusan egy osztályba kell létrehozni az általa készített osztályba. A készítő képes az adott funkciókhoz kódot hozzáadni, így meghatározva, hogy mi történjen.

A készítők JavaScriptben megírhatják a funkció kódját, vagy a korábban létrehozottat használhatják egy adott akcióhoz.

## Vizuális nézet
A fenti struktúrához hasonló kódot generálnánk ki először, ez alapján automatikusan megjelenítenénk weboldalon HTML elemekkel, amiket lehessen mozgatni, szerkeszteni, törölni, és ott helyben kódot hozzáadni. Lehetőség lenne átváltani egy szerkesztő felületre, ahol a teljes osztályhoz tartozó kódot láthatja és szerkesztheti a készítő.

## Játék játszása lehetőség
- A publikus játékokkal tudjanak játszani azok, akik szeretnének, és tudjanak egy szobát készíteni, amelyhez meghívóval lehet csatlakozni.
- A játék készítője a privát játékokhoz tudjon készíteni egy szobát, amelybe meghívóval tud másokat meghívni.
- A szobákban alapértelmezetten legyen egy indítási lehetőség, amely elindítja a játékot, és akkor fusson le például a Setup állapot.
