const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para ejecutar comandos en terminal
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

// Función para analizar vulnerabilidades de la imagen
async function analyzeImage(imageName) {
  const sanitizedImageName = imageName.replace(/[:\/]/g, '-');
  const sarifFileName = `${sanitizedImageName}.sarif.json`;
  const markdownFileName = `${sanitizedImageName}-vulnerabilidades.md`;

  try {
    // Ejecuta el análisis de vulnerabilidades con Docker Scout y guarda el resultado en un archivo SARIF JSON
    const command = `docker scout cves --format sarif --output ${sarifFileName} ${imageName}`;
    console.log(`Analizando la imagen: ${imageName}`);
    
    // Ejecuta el comando de Docker Scout
    await runCommand(command);

    // Lee el archivo SARIF generado
    const result = fs.readFileSync(sarifFileName, 'utf8');
    const sarifData = JSON.parse(result);

    let markdownContent = `# Vulnerabilidades de la imagen: ${imageName}\n\n`;
    markdownContent += `| CVE ID | Severity |\n`;
    markdownContent += `|--------|----------|\n`;

    if (sarifData.runs && sarifData.runs.length > 0 && sarifData.runs[0].results) {
      const rules = sarifData.runs[0].tool.driver.rules;
      const severityMap = new Map();

      if (rules) {
        rules.forEach(rule => {
          if (rule.id && rule.properties && rule.properties['security-severity']) {
            severityMap.set(rule.id, rule.properties['security-severity']);
          }
        });
      }

      sarifData.runs[0].results.forEach(result => {
        const cveId = result.ruleId;
        const severity = severityMap.get(cveId) || 'Unknown';
        markdownContent += `| ${cveId} | ${severity} |\n`;
      });
    } else {
      markdownContent += `No se encontraron vulnerabilidades o el formato SARIF es inesperado.\n`;
    }

    // Guardar el resultado en un archivo Markdown
    fs.writeFileSync(markdownFileName, markdownContent, 'utf8');
    console.log(`Archivo Markdown generado: ${markdownFileName}`);
  } catch (error) {
    console.error('Error al analizar la imagen:', error);
  } finally {
    // Limpiar el archivo SARIF generado solo si existe
    if (fs.existsSync(sarifFileName)) {
      try {
        fs.unlinkSync(sarifFileName);
        console.log(`Archivo SARIF temporal eliminado: ${sarifFileName}`);
      } catch (unlinkError) {
        console.warn(`Advertencia: No se pudo eliminar el archivo SARIF temporal: ${unlinkError.message}`);
      }
    }
  }
}

// Verificar que se haya proporcionado el nombre de la imagen como argumento
const imageName = process.argv[2];

if (!imageName) {
  console.log('Por favor, proporciona el nombre de la imagen como argumento:');
  console.log('Ejemplo: node .\\generarMarkdown.js alpine');
} else {
  // Llamada a la función de análisis con el nombre de la imagen proporcionado
  analyzeImage(imageName);
}

//Automatizar pasar lista de imagenes y se generen automaticamente los markdowns y PDFs
