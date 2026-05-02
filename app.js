/**
 * BUSCADOR LOCAL DE DOCUMENTOS (HTML + JavaScript)
 * Formato de entrega: Archivos separados en una misma carpeta
 * Arquitectura: Procesamiento 100% local en el navegador
 */

// Configuración obligatoria para que PDF.js funcione
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'librerias/pdf.worker.min.js';

// 1. Variables globales
let archivosCargados = [];

// 2. Referencias a elementos del DOM
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileThumbnails = document.getElementById('fileThumbnails');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsList = document.getElementById('resultsList');

// --- BLOQUEO DE COMPORTAMIENTO POR DEFECTO ---
window.addEventListener("dragover", function(e) { e.preventDefault(); }, false);
window.addEventListener("drop", function(e) { e.preventDefault(); }, false);

// --- EVENTOS DE LA ZONA DE ARRASTRE ---

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    }, false);
});

dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    manejarArchivos(files);
});

fileInput.addEventListener('change', (e) => {
    manejarArchivos(e.target.files);
});

// --- PROCESAMIENTO DE ARCHIVOS ---

async function manejarArchivos(files) {
    if (files.length === 0) return;

    for (let file of files) {
        if (archivosCargados.some(f => f.nombre === file.name)) continue;

        try {
            const contenido = await leerContenido(file);
            archivosCargados.push({ 
                nombre: file.name, 
                texto: contenido.toLowerCase() 
            });
        } catch (error) {
            console.error("Error leyendo:", file.name, error);
            archivosCargados.push({ nombre: file.name, texto: "error_lectura" });
        }
    }
    actualizarVistaArchivos();
}

function leerContenido(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const extension = file.name.split('.').pop().toLowerCase();

        // 1. TXT
        if (extension === 'txt') {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        } 
        // 2. PDF
        else if (extension === 'pdf') {
            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let textoCompleto = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        textoCompleto += content.items.map(item => item.str).join(" ") + " ";
                    }
                    resolve(textoCompleto);
                } catch (err) { reject(err); }
            };
            reader.readAsArrayBuffer(file);
        }
        // 3. DOCX (Word)
        else if (extension === 'docx') {
            reader.onload = async (e) => {
                try {
                    const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
                    resolve(result.value);
                } catch (err) { reject(err); }
            };
            reader.readAsArrayBuffer(file);
        }
        // 4. XLSX (Excel)
        else if (extension === 'xlsx') {
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    let textoExcel = "";
                    workbook.SheetNames.forEach(name => {
                        const sheet = workbook.Sheets[name];
                        // Usamos CSV para asegurar que no se pierdan datos de celdas individuales
                        textoExcel += XLSX.utils.sheet_to_csv(sheet) + " ";
                    });
                    resolve(textoExcel);
                } catch (err) { reject(err); }
            };
            reader.readAsArrayBuffer(file);
        } else {
            resolve(""); // Formato no soportado
        }
    });
}

// --- INTERFAZ DE USUARIO ---

function actualizarVistaArchivos() {
    fileThumbnails.innerHTML = "";
    archivosCargados.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
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

// --- BÚSQUEDA ---

function realizarBusqueda() {
    const termino = searchInput.value.toLowerCase().trim();
    resultsList.innerHTML = "";

    if (termino === "" || archivosCargados.length === 0) {
        resultsList.innerHTML = '<p class="placeholder-text">Sube archivos y escribe algo para buscar.</p>';
        return;
    }

    archivosCargados.forEach(file => {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        if (file.texto === "error_lectura") {
            div.innerHTML = `<span>${file.nombre}</span> <span class="badge no-match">Error</span>`;
        } else {
            // Lógica de conteo de coincidencias
            const coincidencias = (file.texto.split(termino).length - 1);
            const clase = coincidencias > 0 ? 'match-count' : 'no-match';
            div.innerHTML = `
                <span>${file.nombre}</span>
                <span class="badge ${clase}">${coincidencias} coincidencias</span>
            `;
        }
        resultsList.appendChild(div);
    });
}

searchBtn.addEventListener('click', realizarBusqueda);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') realizarBusqueda();
});