const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

//Directorio fijo donde se guardarán los MD
const OUTPUT_DIR = path.join(__dirname, 'analisis', 'post-hardening', 'MDs');

// Crear la carpeta si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Ejecutar comandos en terminal
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}\n${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Analizar vulnerabilidades de una imagen
async function analyzeImage(imageName) {
  const sanitizedImageName = imageName.replace(/[:\/]/g, '-');
  const sarifFileName = `${sanitizedImageName}.sarif.json`;

  // 🔥 Rutas completas dentro del directorio fijo
  const markdownPath = path.join(OUTPUT_DIR, `${sanitizedImageName}-vulnerabilidades.md`);
  const sarifPath = path.join(OUTPUT_DIR, sarifFileName);

  try {
    const command = `docker scout cves --format sarif --output "${sarifPath}" ${imageName}`;
    console.log(`\n==== Analizando la imagen: ${imageName} ====`);

    await runCommand(command);

    const sarifContent = fs.readFileSync(sarifPath, 'utf8');
    const sarifData = JSON.parse(sarifContent);

    let markdownContent = `# Vulnerabilidades de la imagen: ${imageName}\n\n`;
    markdownContent += `| CVE ID | Severity |\n`;
    markdownContent += `|--------|----------|\n`;

    // 👉 Contador de CVEs por imagen
    let totalCVEs = 0;

    if (sarifData?.runs?.[0]?.results) {
      const rules = sarifData.runs[0].tool.driver.rules || [];
      const severityMap = new Map();

      rules.forEach(rule => {
        if (rule.id && rule.properties?.['security-severity']) {
          severityMap.set(rule.id, rule.properties['security-severity']);
        }
      });

      sarifData.runs[0].results.forEach(result => {
        const cveId = result.ruleId;
        const severity = severityMap.get(cveId) || 'Unknown';
        markdownContent += `| ${cveId} | ${severity} |\n`;
        totalCVEs++;
      });
    } else {
      markdownContent += `No se encontraron vulnerabilidades o el formato SARIF es inesperado.\n`;
    }

    // 👉 Resumen final del MD
    markdownContent += `\n\n## Resumen\n`;
    markdownContent += `**Total de vulnerabilidades encontradas:** ${totalCVEs}\n`;

    fs.writeFileSync(markdownPath, markdownContent, 'utf8');
    console.log(`Markdown generado: ${markdownPath}`);

  } catch (error) {
    const msg = String(error);

    if (msg.includes('Log in with your Docker ID')) {
      console.error('\n❌ Docker Scout requiere que inicies sesión antes de continuar.');
      console.error('   Ejecuta:  docker login');
      throw new Error('SCOUT_LOGIN_REQUIRED');
    } else {
      console.error('Error al analizar la imagen:', msg);
    }
  } finally {
    if (fs.existsSync(sarifPath)) {
      fs.unlinkSync(sarifPath);
      console.log(`Archivo SARIF temporal eliminado: ${sarifPath}`);
    }
  }
}

// Leer lista de imágenes desde archivo .txt
async function analyzeImagesFromFile(filePath) {
  const abs = path.resolve(filePath);

  if (!fs.existsSync(abs)) {
    console.error(`El archivo ${abs} no existe.`);
    return;
  }

  const content = fs.readFileSync(abs, 'utf8');
  const images = content.split(/\r?\n/)
    .map(x => x.trim())
    .filter(x => x && !x.startsWith('#'));

  console.log(`Analizando ${images.length} imágenes...\n`);

  for (const img of images) {
    try {
      await analyzeImage(img);
    } catch (err) {
      if (String(err.message) === 'SCOUT_LOGIN_REQUIRED') {
        console.error('⛔ Análisis detenido: Docker Scout no está autenticado.');
        break;
      }
    }
  }

  console.log('\n==== Proceso finalizado ====');
}

// MAIN
(async () => {
  const arg = process.argv[2];

  if (!arg) {
    console.log('Uso:');
    console.log('  node generarMarkdown.js nginx:alpine');
    console.log('  node generarMarkdown.js lista.txt');
    return;
  }

  if (arg.endsWith('.txt')) {
    await analyzeImagesFromFile(arg);
  } else {
    await analyzeImage(arg);
  }
})();
