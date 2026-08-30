/** public/ 资源路径，兼容 GitHub Pages 子路径（import.meta.env.BASE_URL） */
export function assetPath(relativePath: string): string {
  const trimmed = relativePath.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${trimmed}`;
}
