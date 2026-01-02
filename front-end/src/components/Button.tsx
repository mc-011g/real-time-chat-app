import type { ReactNode } from "react";

export default function Button({ children, variant, extraClasses, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode, variant: string, extraClasses?: string }) {

  let selectedVariant;

  switch (variant) {
    case "primary-solid":
      selectedVariant = `bg-blue-700 text-white  ${props.disabled ? '' : ''} hover:bg-blue-800 focus:bg-blue-800'}`;
      break;
    case "primary-outline":
      selectedVariant = `outline text-blue-700 border-blue-700 ${props.disabled ? '' : ''} hover:bg-blue-800 focus:bg-blue-800 focus:text-blue-50 hover:text-blue-50 '}`;
      break;
    case "danger-outline":
      selectedVariant = `outline text-red-700 border-red-700 ${props.disabled ? '' : ''} hover:bg-red-800 focus:bg-red-800 focus:text-blue-50 hover:text-blue-50 '}`;
      break;
    case "danger-solid":
      selectedVariant = "bg-red-700 text-red-50 hover:bg-red-800 focus:bg-red-800";
      break;
    default:
      break;
  }

  return (
    <button {...props} className={`transition ${selectedVariant} cursor-pointer px-4 py-2 rounded-lg ${extraClasses}`}>
      {children}
    </button>
  )
}
