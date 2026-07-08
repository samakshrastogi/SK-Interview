const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

// Standard Windows Docker Desktop path
const DOCKER_PATH = 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function isDockerRunning() {
  try {
    await execAsync('docker info');
    return true;
  } catch (error) {
    return false;
  }
}

async function startDockerDesktop() {
  console.log('Checking Docker daemon status...');
  const running = await isDockerRunning();
  if (running) {
    console.log('✅ Docker is already running.');
    return;
  }

  console.log('🚀 Docker is not active. Attempting to start Docker Desktop...');
  
  if (fs.existsSync(DOCKER_PATH)) {
    // Start Docker Desktop in the background
    exec(`start "" "${DOCKER_PATH}"`);
  } else {
    console.warn(`⚠️ Docker Desktop was not found at standard path: ${DOCKER_PATH}`);
    console.log('Please make sure Docker Desktop is installed and started manually.');
  }

  // Poll docker info until daemon starts up (max 30 attempts, 3s delay = 90 seconds)
  const maxAttempts = 30;
  for (let i = 1; i <= maxAttempts; i++) {
    console.log(`⏳ Waiting for Docker daemon to launch (Attempt ${i}/${maxAttempts})...`);
    await delay(3000);
    if (await isDockerRunning()) {
      console.log('✅ Docker daemon connected successfully.');
      return;
    }
  }

  throw new Error('❌ Docker Desktop failed to start in a reasonable timeframe.');
}

async function main() {
  try {
    // 1. Launch Docker Desktop and wait until active
    await startDockerDesktop();

    // 2. Spin up MongoDB and Redis containers
    console.log('🐳 Starting database containers via Docker Compose...');
    const { stdout, stderr } = await execAsync('docker-compose up -d');
    console.log(stdout || 'Databases up and running.');
    if (stderr && !stderr.includes('warning')) {
      console.error(stderr);
    }

    // 3. Start Frontend & Backend Development Servers
    console.log('⚙️ Starting SK CareerHub AI Dev Servers...');
    const devProcess = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      shell: true
    });

    devProcess.on('error', (err) => {
      console.error('Failed to start development script:', err);
    });

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
