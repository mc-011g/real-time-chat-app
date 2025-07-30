import { useRef, useState } from "react";

export default function Tooltip({ extraClasses, position, text, children }: { extraClasses?: string, position: string, text: string, children: React.ReactNode }) {

  const [show, setShow] = useState<boolean>(false);
  const showTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  let isHovering = false;

  const showTooltip = () => {
    if (show) {
      setShow(false);
      return;
    }

    if (showTimeout.current) {
      clearTimeout(showTimeout.current);
    }

    showTimeout.current = setTimeout(() => {
      if (isHovering) {
        setShow(true);
      } else {
        if (showTimeout.current) {
          clearTimeout(showTimeout.current);
        }
      }
    }, 250);
  }

  const hideToolTip = () => {
    if (show) {
      setTimeout(() => {
        if (show) {
          setShow(false);
        }
      }, 250);
    }
  }

  return (
    <div className="flex justify-center" >
      <div onMouseEnter={showTooltip} onMouseLeave={hideToolTip} onMouseOver={() => isHovering = true} onMouseOut={() => isHovering = false} onClick={() => { isHovering = false; setShow(false); }} className="h-[24px]">{children}</div>

      {show &&
        <div className={`${extraClasses} transistion absolute w-fit h-fit z-100 bg-gray-900 rounded-xl px-2 py-1 flex
         ${position === "bottom" ? "top-[1.5lh]" : ""}
          ${position === "top" ? "bottom-[1.5lh]" : ""}
            ${position === "left" ? "right-[1.5lh]" : ""}
           `}>
          <div className="relative flex justify-center">
            <div className="text-gray-50">{text}</div>
            <div className={`absolute flex border-l-red-500 border-r-red-500 border-r-transparent border-l-transparent border-l-10 border-r-10 
        ${position === "top" ? "border-t-gray-900 border-t-12 top-5" : ""} ${position === "bottom" ? "border-b-gray-900 border-b-12 bottom-5" : ""} ${position === "left" && "border-b-gray-900 border-b-12 bottom-1.5 -right-4.25 rotate-90"}
        `}></div>
          </div>
        </div>
      }
    </div>
  )
}
