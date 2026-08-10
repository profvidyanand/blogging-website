import { Node, mergeAttributes } from "@tiptap/core";

/** Preserves AI-inserted inline figures when editing article HTML. */
export const ArticleInlineImage = Node.create({
  name: "articleInlineImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.querySelector("img")?.getAttribute("src"),
      },
      alt: {
        default: "",
        parseHTML: (element) => element.querySelector("img")?.getAttribute("alt") ?? "",
      },
      caption: {
        default: "",
        parseHTML: (element) => element.querySelector("figcaption")?.textContent ?? "",
      },
    };
  },

  parseHTML() {
    return [{ tag: "figure.article-inline-image" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption } = HTMLAttributes;

    return [
      "figure",
      { class: "article-inline-image" },
      ["img", mergeAttributes({ src, alt: alt || "", loading: "lazy" })],
      ["figcaption", {}, caption || ""],
    ];
  },
});
