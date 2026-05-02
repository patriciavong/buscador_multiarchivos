# 📂 Buscador Local de Documentos

### **Descripción**
Este proyecto es una herramienta web de procesamiento **100% local** diseñada para funcionar como un **"Ctrl + F" simultáneo**[cite: 7]. Permite buscar términos específicos dentro de múltiples archivos al mismo tiempo sin comprometer la privacidad de los datos, ya que la información nunca sale de tu computadora[cite: 7].

---

## 🚀 Características
* **Privacidad Total:** Los archivos no se suben a ningún servidor; todo el procesamiento ocurre internamente en el navegador del usuario[cite: 7].
* **Multiformato:** Soporta la lectura y extracción de texto en archivos **PDF, Excel (XLSX), Word (DOCX) y Texto Plano (TXT)**[cite: 7].
* **Conteo de Coincidencias:** Identifica y contabiliza cuántas veces aparece el término buscado en cada documento cargado[cite: 7].
* **Interfaz Intuitiva:** Incluye una zona de interacción moderna con soporte para **arrastrar y soltar** (Drag & Drop)[cite: 7].

---

## 🛠️ Tecnologías Utilizadas
* **Lenguajes:** HTML5, CSS3 y JavaScript (Vanilla)[cite: 3, 4, 7].
* **PDF.js:** Motor para la extracción de texto en documentos PDF utilizando *Web Workers* para no bloquear la interfaz[cite: 7].
* **SheetJS (XLSX):** Procesamiento robusto de hojas de cálculo con conversión a CSV para máxima precisión[cite: 7].
* **Mammoth.js:** Conversión eficiente de archivos `.docx` a texto plano[cite: 7].

---

## 📋 Requisitos e Instalación
Esta herramienta es estática, por lo que **no requiere base de datos** ni servidores complejos.

1. **Clona** este repositorio o descarga los archivos fuente.
2. **Organiza las dependencias:** Asegúrate de que las librerías `.js` externas estén ubicadas en la carpeta `/librerias`[cite: 7].
3. **Ejecuta:** Simplemente abre el archivo `index.html` en tu navegador favorito[cite: 7].

---

## ⚖️ Licencia
Proyecto desarrollado con fines académicos y como herramienta de productividad para el análisis de datos y auditoría[cite: 7].
