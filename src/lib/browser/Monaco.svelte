<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { Subscriber, Writable } from "svelte/store";
  import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import type { editor } from "monaco-editor";
  import { view } from "$lib/state";

  let subscriptions: Subscriber<string>[] = [];
  export let content: Writable<string> | undefined;

  let divEl: HTMLElement;
  let editor: editor.IStandaloneCodeEditor;
  let Monaco;
  const initialFind = getContext("initialFind");

  onMount(async () => {
    self.MonacoEnvironment = {
      getWorker: () => new editorWorker(),
    };

    Monaco = await import("monaco-editor");

    const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const getColor = (name: string) => {
      const rgb = getComputedStyle(document.body).getPropertyValue(`--m3-scheme-${name}`).trim();
      return (
        "#" +
        rgb
          .split(" ")
          .map((x) => parseInt(x).toString(16).padStart(2, "0"))
          .join("")
      );
    };
    const colors = {
      "editor.background": getColor("surface") + "10",
      "editor.foreground": getColor("on-surface"),
      foreground: getColor("on-surface"),
      "editorLineNumber.foreground": getColor("secondary") + "b0",
      "editorLineNumber.activeForeground": getColor("on-surface"),
      "editorLineNumber.dimmedForeground": getColor("secondary") + "80",
      "editorCursor.foreground": getColor("on-surface"),
      "editor.lineHighlightBackground": getColor("primary") + "20",

      "editor.selectionBackground": getColor("primary-container"),
      "selection.background": getColor("primary-container"),
      "editor.inactiveSelectionBackground": getColor("primary-container") + "b0",
      "editor.selectionHighlightBackground": getColor("primary-container") + "80",
      "editor.findMatchBackground": getColor("tertiary-container"),
      "editor.findMatchBorder": getColor("tertiary"),
      "editor.findMatchHighlightBackground": getColor("tertiary-container") + "80",
      "editor.foldBackground": getColor("tertiary-container") + "80",
      "inputValidation.infoBackground": getColor("primary-container"),
      "inputValidation.infoForeground": getColor("on-primary-container"),
      "inputValidation.infoBorder": getColor("primary"),

      "editorBracketMatch.background": isDark
        ? getColor("primary") + "80"
        : getColor("primary") + "50",
      "editorBracketMatch.border": isDark ? getColor("primary") : getColor("primary") + "80",
      "editorBracketHighlight.foreground1": isDark ? "#ffb0c8" : "#a03861", // red
      "editorBracketHighlight.foreground2": isDark ? "#89d5c2" : "#006a5a", // teal
      "editorBracketHighlight.foreground3": isDark ? "#fdb87c" : "#8e4e00", // orange
      "editorBracketHighlight.foreground4": isDark ? "#97cdf4" : "#216388", // cyan
      "editorBracketHighlight.foreground5": isDark ? "#d0bdfb" : "#65548e", // purple
      "editorBracketHighlight.foreground6": isDark ? "#c1cd81" : "#566406", // lime?

      "editorLink.activeForeground": getColor("primary"),
    };
    Monaco.editor.defineTheme("harmonized", {
      base: isDark ? "vs-dark" : "vs",
      inherit: true,
      rules: [
        { token: "keyword", foreground: getColor("primary") },
        { token: "comment", foreground: isDark ? "#c1cd81" : "#566406" },
        { token: "string", foreground: isDark ? "#d0bdfb" : "#65548e" },
        { token: "invalid", foreground: "#0000f0" },
      ],
      colors,
    });
    editor = Monaco.editor.create(divEl, {
      value: "/* Loading... */",
      language: "java",
      theme: "harmonized",
      readOnly: true,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    });
    editor.onDidChangeModelContent(() => {
      const text = editor.getValue();
      subscriptions.forEach((sub) => sub(text));
    });
    content = {
      subscribe(func: Subscriber<string>) {
        subscriptions.push(func);
        return () => {
          subscriptions = subscriptions.filter((sub) => sub != func);
        };
      },
      set(val: string) {
        editor.setValue(val);
      },
      update(updater: (val: string) => string) {
        editor.setValue(updater(editor.getValue()));
      },
    };
    if ($view.editorFind) {
      const findController = editor.getContribution("editor.contrib.findController") as any;
      findController.start({});
      findController._state.change(
        {
          searchString: $view.editorFind.searchString,
          isRegex: $view.editorFind.isRegex || false,
          wholeWord: $view.editorFind.wholeWord || false,
          matchCase: $view.editorFind.matchCase || false,
        },
        false
      );
      editor.focus();
      setTimeout(() => {
        try {
          editor.getAction("editor.action.nextMatchFindAction")!.run();
        } catch (e) {}
      }, 200);
    }

    return () => {
      editor.dispose();
    };
  });
</script>

<div bind:this={divEl} class="h-full w-full" />
<svelte:window
  on:resize={() => {
    editor.layout({ width: 0, height: 0 });
    window.requestAnimationFrame(() => {
      if (!divEl.parentElement) return;
      const rect = divEl.parentElement.getBoundingClientRect();
      editor.layout({ width: rect.width, height: rect.height });
    });
  }}
/>
