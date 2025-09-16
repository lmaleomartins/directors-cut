import * as React from "react"

import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

type InputProps = React.ComponentProps<"input"> & { togglePassword?: boolean };
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, togglePassword, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    const isPassword = type === "password" && togglePassword;
    return (
      <>
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
            style={{top: '50%', transform: 'translateY(-50%)'}} // vertical center
            onClick={() => setShow((v) => !v)}
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            <span className="sr-only">Toggle password visibility</span>
          </button>
        )}
      </>
    );
  }
)
Input.displayName = "Input"

export { Input }
