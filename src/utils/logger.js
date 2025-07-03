import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the config file relative to this util file
const configPath = path.join(__dirname, "../../public/config.json");

let devInfo = null; // Cache the config

async function loadDevInfo() {
  if (devInfo) {
    return devInfo;
  }
  try {
    const configData = await readFile(configPath, "utf8");
    devInfo = JSON.parse(configData);
    return devInfo;
  } catch (error) {
    console.warn(`⚠️ Could not load developer info from ${configPath}: ${error.message}`);
    // Provide default values if config loading fails
    return {
      name: "The Developer",
      github: "your-github",
      linkedIn: "your-linkedin",
      ascii: "🚀", // Default ASCII art
    };
  }
}

/**
 * Gets the current terminal width in columns.
 * In Node.js, this is typically accessed via process.stdout.columns.
 * Provides a fallback value if the terminal width cannot be determined.
 * @returns {number} The terminal width in columns.
 */
function getTerminalWidth() {
  // process.stdout.columns is available in Node.js for terminal width
  return process.stdout.columns || 80; // Default to 80 columns if not detected
}

/**
 * Scales ASCII art to fit a target width.
 * This function performs a basic proportional scaling by sampling characters
 * from the original lines. For complex ASCII art, this might lead to loss of
 * fidelity or become unreadable when significantly scaled down.
 * @param {string} asciiArt - The multi-line ASCII art string.
 * @param {number} targetWidth - The desired maximum width for the scaled art.
 * @returns {string} The scaled ASCII art string.
 */
function scaleAsciiArt(asciiArt, targetWidth) {
  const lines = asciiArt.split('\n');
  if (lines.length === 0) {
    return "";
  }

  // Determine the original maximum line width
  let originalWidth = 0;
  for (const line of lines) {
    if (line.length > originalWidth) {
      originalWidth = line.length;
    }
  }

  // If the original width is already less than or equal to the target, no scaling is needed
  if (originalWidth <= targetWidth) {
    return asciiArt;
  }

  // Calculate the scaling factor
  const scaleFactor = originalWidth / targetWidth;

  const scaledLines = [];
  for (const line of lines) {
    if (line.length === 0) {
      scaledLines.push(""); // Preserve empty lines
      continue;
    }

    let scaledLine = "";
    for (let i = 0; i < targetWidth; i++) {
      // Calculate the corresponding index in the original line
      const originalIndex = Math.floor(i * scaleFactor);
      if (originalIndex < line.length) {
        scaledLine += line[originalIndex];
      } else {
        // Pad with spaces if the scaled line is shorter than targetWidth
        scaledLine += " ";
      }
    }
    scaledLines.push(scaledLine);
  }
  return scaledLines.join('\n');
}

export async function beyonderLogger() {
  const info = await loadDevInfo();
  const borderLength = 60; // Fixed border length for consistency
  const border = "=".repeat(borderLength);

  // Get current terminal width
  const terminalWidth = getTerminalWidth();

  // Calculate target width for ASCII art
  // We subtract a small amount to leave some padding on the sides
  let targetAsciiWidth = terminalWidth - 4;

  // Ensure the target width is at least a reasonable minimum, e.g., 20 characters
  if (targetAsciiWidth < 20) {
    targetAsciiWidth = 20;
  }

  // Scale the ASCII logo if available
  const displayAscii = info.ascii ? scaleAsciiArt(info.ascii, targetAsciiWidth) : "";

  console.log(border);
  console.log(`👋 Howdy! I'm ${info.name}.`);
  console.log("   Your Friendly Neighbourhood Dev Environment! 🚀");
  console.log("\n   Check out my work:");
  console.log(`   GitHub    : https://github.com/${info.github}`);
  console.log(`   LinkedIn  : https://linkedin.com/in/${info.linkedIn}`);
  console.log("\n" + displayAscii); // Display scaled ASCII art
  console.log(border);
}
