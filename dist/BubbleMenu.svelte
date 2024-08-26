<script>import { createPopper } from "@popperjs/core";
import { onDestroy } from "svelte";
import { OFFSCREEN_RECT } from "./popper";
import { editorStores } from "./stores";
export let editor;
let className = "bubble-menu";
export { className as class };
export let offset = 0;
export let padding = 4;
let forLineType = void 0;
export { forLineType as for };
export let placement = "top";
let menu;
let popper = null;
let oldRoot;
let oldDoc;
let mouseDown = false;
let menuHasFocus = false;
let actualPlacement = placement;
const { active, doc, selection, focus, root, updateEditor } = editorStores(editor);
$: updateEditor(editor);
$: activeSelection = getActive(mouseDown, menuHasFocus, $selection);
$: update(menu, $doc);
$: updateRoot($root);
function update(menu2, doc2) {
  if (mouseDown) return;
  if (menu2) {
    if (popper) {
      popper.update();
    } else {
      const element = {
        getBoundingClientRect: () => activeSelection && editor.getBounds(activeSelection) || OFFSCREEN_RECT,
        contextElement: editor.root
      };
      popper = createPopper(element, menu2, {
        placement,
        modifiers: [
          { name: "arrow", options: { element: "[data-arrow]" } },
          { name: "computeStyles", options: { adaptive: false } },
          { name: "offset", options: { offset: [0, offset] } },
          { name: "preventOverflow", options: { padding } },
          {
            name: "dataOutput",
            enabled: true,
            phase: "write",
            fn({ state }) {
              actualPlacement = state.placement.split("-")[0];
            }
          }
        ]
      });
      requestAnimationFrame(() => menu2 && menu2.classList.add("active"));
    }
  } else {
    if (popper && !menuHasFocus) {
      popper.destroy();
      popper = null;
    }
  }
}
function getActive(mouseDown2, menuHasFocus2, selection2) {
  let fixedSelection = selection2 && editor?.trimSelection(selection2);
  let lineType;
  if (fixedSelection && fixedSelection[0] === fixedSelection[1] - 1) {
    const line = editor.doc.getLineAt(fixedSelection[0]);
    const type = editor.typeset.lines.findByAttributes(line.attributes, true);
    if (type.frozen) {
      lineType = type.name;
    }
  }
  if (lineType != forLineType) fixedSelection = null;
  return mouseDown2 || menuHasFocus2 ? activeSelection : fixedSelection;
}
function onMouseDown() {
  mouseDown = true;
}
function onMouseUp() {
  mouseDown = false;
  update(menu, $doc);
}
function updateRoot(root2) {
  if (oldRoot) {
    oldRoot.removeEventListener("mousedown", onMouseDown);
    (oldDoc || oldRoot).removeEventListener("mouseup", onMouseUp);
  }
  oldRoot = root2;
  oldDoc = root2 && root2.ownerDocument;
  if (oldRoot) {
    oldRoot.addEventListener("mousedown", onMouseDown);
    (oldDoc || oldRoot).addEventListener("mouseup", onMouseUp);
  }
}
function onGainFocus(event) {
  if (menuHasFocus || event.target.nodeName === "BUTTON") return;
  editor.modules.selection.pause();
  menuHasFocus = true;
}
function onLoseFocus() {
  if (!menuHasFocus) return;
  editor.modules.selection.resume();
  menuHasFocus = false;
}
onDestroy(() => {
  updateRoot();
  onLoseFocus();
  if (popper) popper.destroy();
});
</script>

{#if activeSelection && activeSelection[0] !== activeSelection[1]}
  <div class={className} on:focusin={onGainFocus} on:focusout={onLoseFocus} bind:this={menu}>
    <slot
      commands={editor.commands}
      active={$active}
      selection={activeSelection}
      focus={$focus}
      placement={actualPlacement}
    ></slot>
  </div>
{/if}
