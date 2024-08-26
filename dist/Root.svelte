<script>import { onMount } from "svelte";
import { docFromDom } from "./rendering/html";
export let editor;
let className = "";
export { className as class };
let root;
let lastEditor;
$: updateEditor(editor, root);
function updateEditor(editor2, root2) {
  if (!root2) return;
  if (lastEditor) {
    lastEditor.destroy();
  }
  lastEditor = editor2;
  if (editor2) {
    editor2.setRoot(root2);
  }
}
onMount(() => {
  if (!root) return;
  const old = Array.from(root.childNodes);
  if (editor && root.children.length) {
    editor.set(docFromDom(editor, root));
  }
  return () => {
    for (let i = 0; i < old.length; i++) root?.appendChild(old[i]);
  };
});
</script>

<div bind:this={root} class={className}>
  <slot></slot>
</div>
