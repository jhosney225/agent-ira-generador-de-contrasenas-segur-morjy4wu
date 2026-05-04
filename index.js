
```javascript
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();
const conversationHistory = [];

// Función para calcular la entropía de una contraseña
function calculateEntropy(password) {
  const charset = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  let possibleChars = 0;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

  if (hasLowercase) possibleChars += charset.lowercase.length;
  if (hasUppercase) possibleChars += charset.uppercase.length;
  if (hasNumbers) possibleChars += charset.numbers.length;
  if (hasSymbols) possibleChars += charset.symbols.length;

  if (possibleChars === 0) return 0;

  const entropy = password.length * Math.log2(possibleChars);
  return Math.round(entropy * 100) / 100;
}

// Función para evaluar la fortaleza de la contraseña
function evaluatePasswordStrength(entropy) {
  if (entropy < 20) return "Muy débil";
  if (entropy < 40) return "Débil";
  if (entropy < 60) return "Moderada";
  if (entropy < 80) return "Fuerte";
  return "Muy fuerte";
}

// Función principal para interactuar con Claude
async function chat(userMessage) {
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: `Eres un asistente experto en seguridad de contraseñas. Tu función es:
1. Generar contraseñas seguras cuando el usuario lo solicite
2. Analizar la entropía y fortaleza de contraseñas
3. Proporcionar consejos sobre seguridad de contraseñas
4. Explicar los requisitos para contraseñas seguras

Cuando generes contraseñas, siempre genera contraseñas de al menos 16 caracteres que incluyan mayúsculas, minúsculas, números y símbolos.
Formato: Cuando sugieras una contraseña, colócala entre comillas simples como: 'ContraseñaEjemplo123!@'`,
    messages: conversationHistory,
  });

  const assistantMessage = response.content[0].text;
  conversationHistory.push({
    role: "assistant",
    content: assistantMessage,
  });

  return assistantMessage;
}

// Función para procesar y analizar contraseñas del mensaje
function extractAndAnalyzePasswords(message) {
  const passwordRegex = /'([^']+)'/g;
  const passwords = [];
  let match;

  while ((match = passwordRegex.exec(message)) !== null) {
    passwords.push(match[1]);
  }

  let analysis = "";
  if (passwords.length > 0) {
    analysis = "\n\n📊 ANÁLISIS DE ENTROPÍA:\n";
    analysis += "─".repeat(50) + "\n";

    passwords.forEach((password, index) => {
      const entropy = calculateEntropy(password);
      const strength = evaluatePasswordStrength(entropy);

      analysis += `\nContraseña ${index + 1}: '${password}'\n`;
      analysis += `  • Longitud: ${password.length} caracteres\n`;
      analysis += `  • Entropía: ${entropy} bits\n`;
      analysis += `  • Fortaleza: ${strength}\n`;

      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);
      const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

      analysis += `  • Características:\n`;
      analysis += `    - Minúsculas: ${hasLower ? "✓" : "✗"}\n`;
      analysis += `    - Mayúsculas: ${hasUpper ? "✓" : "✗"}\n`;
      analysis += `    - Números: ${hasNumbers ? "✓" : "✗"}\n`;
      analysis += `    - Símbolos: ${hasSymbols ? "✓" : "✗"}\n`;
    });

    analysis += "\n" + "─".repeat(50);
  }

  return analysis;
}

// Función para imprimir con color
function printWithColor(text, color = "reset") {
  const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    blue: "\x1b[34m",
  };

  console.log(colors[color] + text + colors.reset);
}

// Función principal para ejecutar el chat interactivo
async function main() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process