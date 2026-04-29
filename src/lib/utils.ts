import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["fontSizeL", "fontSizeXS"],
        },
      ],
      "text-color": [
        {
          text: ["textBlack800", "textBlack100", "textBlack300"],
        },
      ],
      "bg-color": [
        {
          bg: ["textBlack800", "textBlack100", "textBlack300"],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
