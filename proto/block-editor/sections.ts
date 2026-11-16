export function sectionsOf(blocks, activeId) {
  const sections = [];
  for (const block of blocks) {
    if (block.type === "h1" || block.type === "h2") {
      sections.push({ heading: block, ids: [block.id], todos: 0, done: 0 });
    } else if (sections.length) {
      const section = sections.at(-1);
      section.ids.push(block.id);
      if (block.type === "todo") {
        section.todos += 1;
        if (block.checked) section.done += 1;
      }
    }
  }
  return { sections, current: sections.find((section) => section.ids.includes(activeId)) };
}

export function nameOf(section) {
  return section.heading.text || "Untitled heading";
}
