import logo from "@/assets/encrypted-logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <img 
      src={logo} 
      alt="Encrypted Battle Pass" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};