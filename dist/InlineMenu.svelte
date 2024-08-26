<script>import { createPopper } from "@popperjs/core";
import { OFFSCREEN_RECT } from "./popper";
import { getLineElementAt } from "./rendering/position";
import { editorStores } from "./stores";
export let editor;
export let atLine = false;
export let hover = false;
export let any = false;
let className = "inline-menu";
export { className as class };
export let line = null;
let menu;
let popper = null;
let oldRoot;
let menuHasFocus = false;
let isMouseDown = false;
const { active, doc, selection, focus, root, updateEditor } = editorStores(editor);
$: updateEditor(editor);
$: activeSelection = getActive(menuHasFocus, $selection);
$: sel = !hover && activeSelection && activeSelection[0] === activeSelection[1] ? activeSelection : null;
$: at = sel && sel[0];
$: line = at || at === 0 ? $doc.getLineAt(at) : null;
$: lineElement = line && at !== null && getLineElementAt(editor, at) || null;
$: show = canShow(line);
$: update(menu, lineElement);
$: listen(hover, $root);
function update(menu2, lineElement2) {
  if (menu2) {
    if (popper) {
      popper.update();
    } else {
      const element = {
        getBoundingClientRect: () => {
          if (atLine) {
            if (!lineElement2) return OFFSCREEN_RECT;
            const { x, y, height } = lineElement2.getBoundingClientRect();
            return new DOMRect(x, y, 0, height);
          } else return editor.getBounds(at) || OFFSCREEN_RECT;
        },
        contextElement: editor.root
      };
      popper = createPopper(element, menu2, {
        placement: "right"
      });
      if (isMouseDown) menu2.style.pointerEvents = "none";
      requestAnimationFrame(() => menu2 && menu2.classList.add("active"));
    }
  } else {
    if (popper && !menuHasFocus) {
      popper.destroy();
      popper = null;
    }
  }
}
function canShow(line2) {
  if (!line2 || line2.length !== 1) return false;
  const { lines } = editor.typeset;
  const type = lines.findByAttributes(line2.attributes, true);
  return type === lines.default || any && !type.frozen;
}
function getActive(menuHasFocus2, selection2) {
  return menuHasFocus2 ? activeSelection : selection2;
}
function onMouseOver(event) {
  const { root: root2 } = editor;
  let node = event.target;
  while (node && node !== root2 && node.parentNode !== root2) {
    node = node.parentNode;
  }
  if (!node) return;
  const line2 = $doc.getLineBy(node.key);
  if (line2) {
    at = $doc.getLineRange(line2)[0];
  }
}
function onMouseLeave(event) {
  if (menu && menu.contains(event.relatedTarget)) {
    return;
  }
  at = null;
}
function onRootMouseDown() {
  if (!$root) return;
  isMouseDown = true;
  $root.ownerDocument.addEventListener("mouseup", onDocumentMouseUp);
}
function onDocumentMouseUp(event) {
  isMouseDown = false;
  if (menu?.style.pointerEvents) menu.style.pointerEvents = "";
  event.target.removeEventListener("mouseup", onDocumentMouseUp);
}
function listen(hover2, root2) {
  if (oldRoot) {
    oldRoot.removeEventListener("mousedown", onRootMouseDown);
    oldRoot.removeEventListener("mouseover", onMouseOver);
    oldRoot.removeEventListener("mouseleave", onMouseLeave);
  }
  if (root2) {
    root2.addEventListener("mousedown", onRootMouseDown);
    if (hover2) {
      root2.addEventListener("mouseover", onMouseOver);
      root2.addEventListener("mouseleave", onMouseLeave);
    }
  }
  oldRoot = root2;
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
function onMouseDown() {
  if (!activeSelection || activeSelection[0] !== at) {
    editor.select(at);
  }
}
</script>

{#if show}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class={className} on:focusin={onGainFocus} on:focusout={onLoseFocus} on:mousedown={onMouseDown} bind:this={menu}>
    <slot commands={editor.commands} active={$active} selection={$selection} focus={$focus}></slot>
  </div>
{/if}
