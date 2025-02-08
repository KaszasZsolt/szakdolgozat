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
