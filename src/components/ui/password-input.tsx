"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function PasswordInput({ className, ...props }: React.ComponentProps<"input">) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} className={cn("pr-9", className)} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? "Թաքցնել գաղտնաբառը" : "Ցույց տալ գաղտնաբառը"}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
