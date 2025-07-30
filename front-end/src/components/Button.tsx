import type { ReactNode } from "react";

export default function Button({ children, variant, extraClasses, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode, variant: string, extraClasses?: string }) {

  let selectedVariant;

  switch (variant) {
    case "primary-solid":
      selectedVariant = `bg-blue-500 text-white  ${props.disabled ? '' : 'hover:bg-blue-600'}`;
      break;
    case "primary-outline":
      selectedVariant = `outline text-blue-500 border-blue-500 ${props.disabled ? 'hover:border-blue-500 text-black' : 'hover:bg-blue-600 hover:text-white '}`;
      break;
    case "danger-outline":
      selectedVariant = `outline text-red-500 border-red-500 ${props.disabled ? 'hover:border-red-500 text-black' : 'hover:bg-red-600 hover:text-white '}`;
      break;
    case "danger-solid":
      selectedVariant = "bg-red-500 text-white hover:bg-red-600";
      break;
    default:
      break;
  }

  return (
    <button {...props} className={`${selectedVariant} transition px-4 py-2 rounded-xl ${props.disabled ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"} ${extraClasses}`}>
      {children}
    </button>
  )
}
