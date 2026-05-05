/* ============================================
   JARVIS LITE — Markdown Renderer
   Lightweight markdown to HTML converter
   ============================================ */

// eslint-disable-next-line no-unused-vars
class MarkdownRenderer {
  render(text) {
    if (!text) return '';

    let html = this._escapeHtml(text);

    // Code blocks with language
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      const langLabel = lang || 'text';
      const header = `<div class="code-block-header"><span class="code-lang">${langLabel}</span><button class="copy-code-btn" onclick="markdownRenderer.copyCode(this)">Copy</button></div>`;
      return `${header}<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered lists
    html = html.replace(/^[*-] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');

    // Line breaks (but not inside pre/code blocks)
    html = html.replace(/\n/g, '<br>');

    // Clean up excessive breaks
    html = html.replace(/(<br>){3,}/g, '<br><br>');
    html = html.replace(/<\/h([1-3])><br>/g, '</h$1>');
    html = html.replace(/<\/li><br>/g, '</li>');
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<\/blockquote><br>/g, '</blockquote>');
    html = html.replace(/<\/pre><br>/g, '</pre>');
    html = html.replace(/<hr><br>/g, '<hr>');

    return html;
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  copyCode(button) {
    const pre = button.closest('.code-block-header').nextElementSibling;
    const code = pre?.querySelector('code');
    if (code) {
      navigator.clipboard.writeText(code.textContent).then(() => {
        const original = button.textContent;
        button.textContent = 'Copied!';
        button.style.color = 'var(--neon-green)';
        button.style.borderColor = 'var(--neon-green)';
        setTimeout(() => {
          button.textContent = original;
          button.style.color = '';
          button.style.borderColor = '';
        }, 2000);
      });
    }
  }
}

const markdownRenderer = new MarkdownRenderer();
