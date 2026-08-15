/**
 * Lightweight SVG Math Captcha Generator
 */
function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  const answer = (num1 + num2).toString();

  const questionText = `${num1} + ${num2} = ?`;

  // Simple clean SVG rendering
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="140" height="42" viewBox="0 0 140 42">
      <rect width="100%" height="100%" fill="#f1f5f9" rx="6" stroke="#cbd5e1" stroke-width="1"/>
      <line x1="10" y1="10" x2="130" y2="32" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="15" y1="35" x2="120" y2="8" stroke="#e2e8f0" stroke-width="2"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="bold" letter-spacing="2">
        ${questionText}
      </text>
    </svg>
  `;

  return {
    svg: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    answer,
  };
}

module.exports = {
  generateCaptcha,
};
