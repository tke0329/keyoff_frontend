import LoginForm from "@/components/login-form";
export const metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};
export default function Login() {
  return (
    <main id="main" className="auth-page container">
      <div className="auth-intro">
        <p className="eyebrow">KEYOFF / ACCOUNT ACCESS</p>
        <h1>
          Your space.
          <br />
          <em>Your story.</em>
        </h1>
        <p>
          나만의 소개와 음악,
          <br />
          새로운 이야기를 이어가세요.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
