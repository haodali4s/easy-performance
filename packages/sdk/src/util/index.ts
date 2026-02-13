export function getSelector(element: HTMLElement | null) {
  if (!element || element.nodeType !== 1) return "";

  // 如果有 id，直接返回 #id
  if (element.id) {
    return `#${element.id}`;
  }

  // 递归向上查找
  let path = [];
  while (element) {
    let name = element.localName;
    if (!name) break;

    // 如果有 id，拼接后停止
    if (element.id) {
      path.unshift(`#${element.id}`);
      break;
    }

    // 加上 class
    let className = element.getAttribute("class");
    if (className) {
      name += "." + className.split(/\s+/).join(".");
    }
    path.unshift(name);
    element = element.parentElement;
  }

  return path.join(" > ");
}
