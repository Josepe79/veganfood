const http = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BIN_DIR = path.join(__dirname, '..', 'bin');
const FFMPEG_URL = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz';

async function downloadFFmpeg() {
    // 1. Solo descargar en Linux (Railway)
    if (process.platform !== 'linux') {
        console.log('[Downloader] Saltando descarga: No estamos en Linux.');
        return;
    }

    if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true });

    const archivePath = path.join(BIN_DIR, 'ffmpeg.tar.xz');
    
    console.log(`[Downloader] Descargando FFmpeg Full desde ${FFMPEG_URL}...`);
    
    const file = fs.createWriteStream(archivePath);
    
    http.get(FFMPEG_URL, (response) => {
        response.pipe(file);
        
        file.on('finish', () => {
            file.close();
            console.log('[Downloader] Descarga completada. Extrayendo...');
            
            try {
                // Usamos tar para extraer. El flag -J es para .xz
                // Buscamos el binario ffmpeg dentro del tar y lo movemos a la raíz de bin/
                execSync(`tar -xJf ${archivePath} -C ${BIN_DIR} --strip-components=1`);
                
                // Aseguramos permisos de ejecución
                const ffmpegPath = path.join(BIN_DIR, 'ffmpeg');
                if (fs.existsSync(ffmpegPath)) {
                    fs.chmodSync(ffmpegPath, '755');
                    console.log(`[Downloader] !!! FFmpeg Full instalado con éxito en: ${ffmpegPath}`);
                    
                    // Verificamos versión y filtros (esto fallará si el binario es incompatible, pero es poco probable en Railway amd64)
                    const version = execSync(`${ffmpegPath} -version`).toString().split('\n')[0];
                    console.log(`[Downloader] Versión verificada: ${version}`);
                }
                
                // Limpiar el archivo comprimido
                fs.unlinkSync(archivePath);
                
            } catch (err) {
                console.error('[Downloader] Error durante la extracción:', err.message);
                // Si falla tar -xJf, intentamos una descarga alternativa más simple si fuera necesario
            }
        });
    }).on('error', (err) => {
        console.error('[Downloader] Error de descarga:', err.message);
        fs.unlinkSync(archivePath);
    });
}

downloadFFmpeg();
