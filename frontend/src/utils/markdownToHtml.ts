/**
 * Converts markdown syntax to HTML
 * Supports: headers (#, ##, ###, etc.), bold (**text**), italic (*text*), lists, etc.
 */
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Convert headers (must be done before other conversions)
  // H6 first, then H5, etc. to avoid conflicts
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  
  // Convert bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Convert italic (*text* or _text_)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Convert unordered lists (lines starting with -, *, or +)
  html = html.replace(/^[\-\*\+]\s+(.+)$/gm, '<li>$1</li>');
  
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  
  // Convert ordered lists (lines starting with numbers)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  
  // Convert blockquotes (lines starting with >)
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Convert horizontal rules (---, ***, or ___)
  html = html.replace(/^[\-\*_]{3,}$/gm, '<hr>');
  
  // Convert inline code (`code`)
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Convert links [text](url)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  return html;
};
