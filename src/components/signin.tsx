"use client";
import { signIn } from "next-auth/react";
import { ReactNode } from "react";


interface SignInButtonProps {
  variant?: "default" | "fullWidth" | "withIcon"; 
  label?: string; 
  icon?: ReactNode; 
}
const SignInButton: React.FC<SignInButtonProps> = ({
  variant = "default",
  label = "Sign In/Log In",
  icon,
}) => {
 
  const baseClasses =
    "rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 cursor-pointer";
  const variantClasses = {
    default: "px-6 py-2",
    fullWidth: "w-full py-3 relative group overflow-hidden", 
    withIcon: "px-8 py-4 text-lg flex items-center gap-2 glowing-btn", 
  };
  const handleSignIn = () => {
    signIn("google");
  };

  return (
    <button
      onClick={handleSignIn}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {variant === "withIcon" && icon && <span>{icon}</span>}
      <span className={variant === "fullWidth" ? "relative z-10" : ""}>
        {label}
      </span>
    </button>
  );
};

export default SignInButton;
