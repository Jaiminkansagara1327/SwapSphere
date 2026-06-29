"use client";

import { useEffect } from "react";

export default function HideClerkKeyless() {
  useEffect(() => {
    const hideKeylessElements = () => {
      const traverse = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          if (
            text.includes("created your first user") ||
            text.includes("keyless mode") ||
            text.includes("Claim your keys")
          ) {
            let container: HTMLElement | null = node.parentElement;
            while (container) {
              let parent: HTMLElement | null = container.parentElement;
              if (!parent && container.getRootNode() instanceof ShadowRoot) {
                parent = (container.getRootNode() as ShadowRoot).host as HTMLElement;
              }

              if (!parent || parent === document.body || parent.tagName === "HTML") {
                break;
              }

              const style = window.getComputedStyle(container);
              if (
                style.position === "fixed" ||
                style.position === "absolute" ||
                container.className.includes("clerk") ||
                container.className.includes("keyless")
              ) {
                break;
              }
              container = parent;
            }
            if (container && container !== document.body) {
              container.style.setProperty("display", "none", "important");
            }
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.shadowRoot) {
            traverse(el.shadowRoot);
          }
        }

        node.childNodes.forEach(traverse);
      };

      traverse(document.body);
    };

    // Run initially
    hideKeylessElements();

    // Set up a mutation observer to hide it if injected later
    const observer = new MutationObserver(() => {
      hideKeylessElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
