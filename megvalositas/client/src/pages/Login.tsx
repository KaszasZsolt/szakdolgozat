import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, ChangeEvent, FormEvent } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { login, register } from "@/services/authService";
interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData extends LoginFormData {
  confirmPassword: string;
}
const AuthPage = ({ isLogin }: { isLogin: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData | RegisterFormData>(
    isLogin
      ? { email: "", password: "" }
      : { email: "", password: "", confirmPassword: "" }
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Regisztráció esetén ellenőrizzük, hogy a két jelszó megegyezik-e
    if (!isLogin && (formData as RegisterFormData).confirmPassword !== formData.password) {
      setErrorMessage(t("auth.password_mismatch", "A jelszavak nem egyeznek meg."));
      return;
    }

    try {
      if (isLogin) {
        const data = await login(formData.email, formData.password);
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          navigate("/dashboard");
        }
      } else {
        const data = await register(formData.email, formData.password);
        alert(data.message);
        navigate("/login");
      }
    } catch (error: unknown) {
      console.error("Hiba:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="bg-white lg:px-[22vw] md:px-20 px-8 pt-[12vh] pb-[4vh]">
      <h1 className="text-3xl font-bold text-primary text-center ">
        {isLogin ? t("auth.login_title", "Bejelentkezés") : t("auth.register_title", "Regisztráció")}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 p-6 bg-color-motto rounded-lg shadow-md">
        <div className="mb-4">
          <label className="text-secondary">{t("auth.email", "Email")}</label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("auth.email_placeholder", "Adja meg az email címét")}
            required
          />
        </div>
        <div className="mb-4">
          <label className="text-secondary">{t("auth.password", "Jelszó")}</label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t("auth.password_placeholder", "Adja meg a jelszavát")}
            required
          />
        </div>
        {!isLogin && (
          <div className="mb-4">
            <label className="text-secondary">{t("auth.confirm_password", "Jelszó megerősítése")}</label>
            <Input
              type="password"
              name="confirmPassword"
              value={(formData as RegisterFormData).confirmPassword || ""}
              onChange={handleChange}
              placeholder={t("auth.confirm_password_placeholder", "Ismételje meg a jelszót")}
              required
            />
          </div>
        )}

        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        <Button type="submit" className="w-full mt-4">
          {isLogin ? t("auth.login_button", "Bejelentkezés") : t("auth.register_button", "Regisztráció")}
        </Button>
      </form>
      <br />
      <Link to={isLogin ? "/register" : "/login"}>
        <button className="button-primary">
          <label className="text-primary">
            {isLogin ? t("auth.no_account", "Nincs fiókod? Regisztrálj!") : t("auth.have_account", "Már van fiókod? Jelentkezz be!")}
          </label>
        </button>
      </Link>
    </div>
  );
};

export const Login = () => <AuthPage isLogin={true} />;
export const Register = () => <AuthPage isLogin={false} />;
