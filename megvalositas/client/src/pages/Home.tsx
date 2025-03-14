import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

  const milestones = [
    {
      id: 1,
      period: "2024.02.10 -ig",
      tasks:
        "Papíralapú tervezés és alap struktúra megtervezése<br> - Papíron két játék levezetése.<br> - Állapotgép példák készítése.<br> - Időbeosztás véglegesítése.<br> - Repository létrehozása.<br> - README elkészítése.",
    },
    {
      id: 2,
      period: "2024.02.11–02.17. (7. hét)",
      tasks:
        "Frontend és Backend alapok egyidejű megvalósítása<br> - <strong>Frontend</strong>: Regisztráció és bejelentkezés UI (React, formázás, navigáció).<br> - <strong>Backend</strong>: Felhasználói fiókok kezelése, MySQL adatbázis beállítása.",
    },
    {
      id: 3,
      period: "2024.02.18–02.24. (8. hét)",
      tasks:
        "Játék létrehozásának felülete – vizuális szerkesztő + Backend API alapok<br> - <strong>Frontend</strong>: Játék létrehozó UI első verziója, komponensek mozgatása, szerkesztése.<br> - <strong>Backend</strong>: API-k a játékok tárolására és lekérésére.",
    },
    {
      id: 4,
      period: "2024.02.25–03.02. (9. hét)",
      tasks:
        "Vizuális szerkesztő bővítése + Backend fejlesztés folytatása<br> - <strong>Frontend</strong>: Kód szerkesztése és hozzáadása frontendről, állapotok és akciók módosítása UI-n.<br> - <strong>Backend</strong>: Játékok tárolása adatbázisban, API kiterjesztése.",
    },
    {
      id: 5,
      period: "2024.03.03–03.09. (10. hét)",
      tasks:
        "Játékok mentése és betöltése + Frontend és Backend összekapcsolása<br> - <strong>Frontend</strong>: A játékok mentésének és betöltésének frontend oldali megvalósítása.<br> - <strong>Backend</strong>: Játékadatok validálása és biztonságos tárolása.",
    },
    {
      id: 6,
      period: "2024.03.10–03.16. (11. hét)",
      tasks:
        "Backend továbbfejlesztése – Állapotgépek és szabályok kezelése<br> - <strong>Frontend</strong>: UI továbbfejlesztése a szabályok kezelésére.<br> - <strong>Backend</strong>: Állapotgépek működésének implementálása és API kapcsolat létrehozása.",
    },
    {
      id: 7,
      period: "2024.03.17–03.23. (12. hét)",
      tasks:
        "Játékok kezelése és adminisztrációs funkciók<br> - <strong>Frontend</strong>: Mentett játékok listázása, szerkesztése, törlése UI-n.<br> - <strong>Backend</strong>: Jogosultságok kezelése a mentett játékokhoz.",
    },
    {
      id: 8,
      period: "2024.03.24–03.31. (13. hét)",
      tasks:
        "Szobák létrehozása és többjátékos rendszer kialakítása<br> - <strong>Frontend</strong>: UI szobakezeléshez és csatlakozáshoz.<br> - <strong>Backend</strong>: Szobák és játékszabályok API implementálása.",
    },
    {
      id: 9,
      period: "2024.04.01–04.07. (14. hét)",
      tasks:
        "Játékmenet és interakciók finomhangolása<br> - <strong>Frontend</strong>: Játék UI véglegesítése, animációk és interaktív elemek hozzáadása.<br> - <strong>Backend</strong>: Szobák közötti kommunikáció és valós idejű frissítések.",
    },
    {
      id: 10,
      period: "2024.04.08–04.14. (15. hét)",
      tasks:
        "Tesztek és hibajavítás<br> - <strong>Frontend</strong>: Felhasználói tesztelés és UI hibajavítás.<br> - <strong>Backend</strong>: Biztonsági és teljesítménytesztek.",
    },
    {
      id: 11,
      period: "2024.04.15–04.25. (16–17. hét)",
      tasks:
        "Dokumentáció elkészítése és rendszer véglegesítése<br> - Kódrészletek és ábrák hozzáadása.<br> - Végső hibajavítások és optimalizálás.",
    },
    {
      id: 12,
      period: "2024.04.26.",
      tasks: "Dolgozat leadása",
    },
  ];

  return (
    <div className="bg-white lg:px-[22vw] md:px-16 sm:px-10 px-4 pt-[12vh] pb-[4vh]">
      {/* Fő cím */}
      <h1 className="text-3xl font-bold text-primary text-center text-white">
        {t("news.title", "Fejlesztési Időbeosztás")}
      </h1>

      {/* Időbeosztás */}
      <div className="mt-8 p-6 bg-color-motto rounded-lg shadow-md overflow-x-auto flex justify-center">
        <table className="min-w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">
                {t("milestone.number", "Mérföldkő száma")}
              </th>
              <th className="border border-gray-300 px-4 py-2">
                {t("milestone.period", "Időszak")}
              </th>
              <th className="border border-gray-300 px-4 py-2">
                {t("milestone.tasks", "Feladatok / Mérföldkövek")}
              </th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((milestone) => (
              <tr key={milestone.id} className="border border-gray-300">
                <td className="border border-gray-300 px-4 py-2 text-center text-white">
                  {milestone.id}.
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-white">
                  {milestone.period}
                </td>
                <td
                  className="border border-gray-300 px-4 py-2 text-white"
                  dangerouslySetInnerHTML={{ __html: milestone.tasks }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;