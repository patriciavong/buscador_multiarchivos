/**
 * BUSCADOR LOCAL DE DOCUMENTOS
 * Optimizaciones: 
 * 1. Búsqueda exacta de términos (case-insensitive).
 * 2. Soporte de carpetas y archivos.
 * 3. Limpieza de datos en Excel para frases con espacios.
 */

// --- 1. CONFIGURACIÓN DE LIBRERÍAS ---
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'librerias/pdf.worker.min.js';

let archivosCargados = [];

// --- 2. REFERENCIAS AL DOM ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileThumbnails = document.getElementById('fileThumbnails');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsList = document.getElementById('resultsList');

// --- 3. MANEJO DE EVENTOS ---

// Evitar que el navegador abra el archivo al soltarlo
window.addEventListener("dragover", e => e.preventDefault());
window.addEventListener("drop", e => e.preventDefault());

// Estilo visual al arrastrar
dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

// Al soltar archivos o carpetas en la zona azul
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    manejarArchivos(e.dataTransfer.files);
});

// Al seleccionar archivos/carpetas con el botón
fileInput.addEventListener('change', (e) => {
    manejarArchivos(e.target.files);
});

// --- 4. PROCESAMIENTO DE ARCHIVOS ---

async function manejarArchivos(files) {
    if (files.length === 0) return;
    const lista = Array.from(files);

    for (let file of lista) {
        // Filtros: ignorar archivos ocultos, vacíos o ya cargados
        if (file.name.startsWith('.') || file.size === 0) continue;
        if (archivosCargados.some(f => f.nombre === file.name)) continue;

        try {
            const contenido = await leerContenido(file);
            // Solo agregar si el archivo tiene texto legible
            if (contenido && contenido.trim() !== "") {
                archivosCargados.push({ 
                    nombre: file.name, 
                    texto: contenido.toLowerCase() 
                });
            }
        } catch (error) {
            console.error("Error al procesar:", file.name, error);
        }
    }
    actualizarVistaArchivos();
}

/**
 * Lee el contenido según la extensión del archivo.
 */
function leerContenido(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const ext = file.name.split('.').pop().toLowerCase();

        // EXCEL (.xlsx)
        if (ext === 'xlsx') {
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const wb = XLSX.read(data, { type: 'array' });
                    let textoExcel = "";
                    wb.SheetNames.forEach(name => {
                        // REEMPLAZO CLAVE: Cambiamos comas por espacios para que "Jonas Brother" sea una sola frase
                        textoExcel += XLSX.utils.sheet_to_csv(wb.Sheets[name]).replace(/,/g, ' ') + " ";
                    });
                    resolve(textoExcel);
                } catch (err) { reject(err); }
            };
            reader.readAsArrayBuffer(file);
        } 
        // PDF (.pdf)
        else if (ext === 'pdf') {
            reader.onload = async (e) => {
                try {
                    const pdf = await pdfjsLib.getDocument(new Uint8Array(e.target.result)).promise;
                    let textoPDF = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        textoPDF += content.items.map(item => item.str).join(" ") + " ";
                    }
                    resolve(textoPDF);
                } catch (err) { reject(err); }
            };
            reader.readAsArrayBuffer(file);
        }
        // WORD (.docx)
        else if (ext === 'docx') {
            reader.onload = async (e) => {
                try {
                    const res = await mammoth.extractRawText({ arrayBuffer: e.target.result });
                    resolve(res.value);
                } catch (err) { reject(err); }
            };
            reader.readAsArrayBuffer(file);
        }
        // TEXTO (.txt)
        else if (ext === 'txt') {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
        } else {
            resolve(""); 
        }
    });
}

// --- 5. INTERFAZ Y BÚSQUEDA ---

/**
 * Actualiza las "burbujas" de archivos cargados.
 */
function actualizarVistaArchivos() {
    fileThumbnails.innerHTML = "";
    archivosCargados.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        // Usamos la clase remove-btn del CSS para la cruz roja
        div.innerHTML = `
            <span>${file.nombre}</span>
            <button class="remove-btn" onclick="eliminarArchivo(${index})">×</button>
        `;
        fileThumbnails.appendChild(div);
    });
}

window.eliminarArchivo = (index) => {
    archivosCargados.splice(index, 1);
    actualizarVistaArchivos();
};

/**
 * Realiza la búsqueda exacta (no sensible a mayúsculas).
 */
function realizarBusqueda() {
    const termino = searchInput.value.toLowerCase().trim();
    resultsList.innerHTML = "";

    if (!termino || archivosCargados.length === 0) return;

    archivosCargados.forEach(file => {
        // Contamos cuántas veces aparece el término exacto
        const coincidencias = file.texto.split(termino).length - 1;
        const clase = coincidencias > 0 ? 'match-count' : 'no-match';
        
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <span>${file.nombre}</span>
            <span class="badge ${clase}">${coincidencias} coincidencias</span>
        `;
        resultsList.appendChild(div);
    });
}

// Botón buscar y tecla Enter
searchBtn.addEventListener('click', realizarBusqueda);
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') realizarBusqueda(); });