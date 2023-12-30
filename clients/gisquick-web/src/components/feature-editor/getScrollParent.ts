export function getScrollableParent(node: HTMLElement | null): HTMLElement | null {
  if (node == null) return null
  if (node.scrollHeight > node.clientHeight) return node
  return getScrollableParent(node.parentNode as HTMLElement | null)
}