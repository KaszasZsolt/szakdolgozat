import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="py-[32vh] px-[24vw]">
      <h1 className="text-5xl text-header">
        {t("notFound.title")}
      </h1>
      <br/>
      <p className="text-lg text-primary">
        {t("notFound.message")}
      </p>
      <br/>
      <Link to="/">
        <button className="button-primary"
          onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}>
          {t("notFound.button")}
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
