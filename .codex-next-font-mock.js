const makeCss = (family) => `
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url(https://example.com/${family.toLowerCase().replace(/\s+/g, '-')}.woff2) format('woff2');
}
`;

function fontCssFor(url) {
  const key = String(url).toLowerCase();

  if (key.includes('lexend')) {
    return makeCss('Lexend Deca');
  }

  return makeCss('Inter');
}

module.exports = new Proxy(
  {},
  {
    get(_target, url) {
      return fontCssFor(url);
    },
  }
);
