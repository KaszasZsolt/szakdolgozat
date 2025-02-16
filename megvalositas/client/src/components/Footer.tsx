import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return ( 
    <footer className="w-full px-6 py-4 bg-[var(--primary-color)] text-white flex flex-col sm:flex-row gap-5 items-center justify-between mt-auto">
      <h1 className="text-center font-brush text-2xl sm:text-4xl">
        {t("footer.company")}
      </h1>
      <p className="text-xs sm:text-sm text-right">
        {t("footer.copy")}
      </p>
    </footer>
  );
};

export default Footer;
