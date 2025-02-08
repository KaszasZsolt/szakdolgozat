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
      ElsoKor : Kezdő lap lerakása
      ElsoKor --> JatekKor : Első kör vége

      state JatekKor {
         [*] --> KorAktivalas
         KorAktivalas : Laphúzás, megfelelő lap lerakása
         KorAktivalas : Különleges lapok kezelése (pl. ász, X-es, alsó, VII, VIII)
         KorAktivalas : "Makaó" bemondása utolsó előtti lapnál
         KorAktivalas : Büntető lap húzása elfelejtett bemondásért
         KorAktivalas --> KorVege : Játék vége állapot ellenőrzése
         KorVege --> [*]
      }

      JatekKor --> JatekVege : Ha játék vége feltétel teljesül

      JatekVege --> Kiertekeles : Pontszámok kiszámítása
      Kiertekeles : Kézben maradt lapok összegzése
      Kiertekeles : 10 osztás után győztes megállapítása
      Kiertekeles --> [*]
    }

    Jatekmenet --> [*]
