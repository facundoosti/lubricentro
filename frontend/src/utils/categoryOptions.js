// Aplana el árbol de categorías en opciones para Combobox: padres primero, hijos indentados (`depth`).
export const buildCategoryOptions = (categories = []) => {
  const byParent = {};
  categories.forEach((c) => {
    const key = c.parent_id ?? 'root';
    if (!byParent[key]) byParent[key] = [];
    byParent[key].push(c);
  });
  const flatten = (parentId, depth) => {
    const children = byParent[parentId] || [];
    return children.flatMap((c) => [
      { value: String(c.id), label: c.name, depth },
      ...flatten(c.id, depth + 1),
    ]);
  };
  return flatten('root', 0);
};
