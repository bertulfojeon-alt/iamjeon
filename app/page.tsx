import { ViewTransition } from "react";
import { Theatre } from "@/components/theatre/Theatre";
import { BehindTheDesk } from "@/components/night/BehindTheDesk";
import { screenItems } from "@/content/screen-items";

export default function HomePage() {
  const items = screenItems();

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main>
        <Theatre items={items} about={<BehindTheDesk />} />
      </main>
    </ViewTransition>
  );
}
