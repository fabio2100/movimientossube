import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min';
import MainData from './mainData';

function PdfReader() {
  const [text, setText] = useState('');
  const [fileContent, setFileContent] = useState(null);

  const processText = (text) => {
    console.log('Texto recibido para procesar:', text);
    // Dividir el texto en líneas
    const lines = text.split('\n').filter(line => line.trim());
    
    // Procesar las líneas de la tabla
    const items = [];
    const entitySet = new Set();
    const movementTypeSet = new Set();

    // Expresión regular para extraer los datos de cada línea
    const regexPattern = /\$\s*([-\d,.]+)\s+(?:Interno\s+\d+\s+)?([^U][A-Z][^\d]+?)\s+(Uso(?:\s+con\s+RED\s+SUBE\s+\d+)?|Carga\s+virtual)\s+(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/;

    for (const line of lines) {
      console.log('Procesando línea:', line);
      // Ignorar líneas de encabezado y pie de página
      if (line.includes('Página') || line.includes('Movimientos registrados') || !line.trim()) {
        continue;
      }

      const matches = line.match(regexPattern);
      if (matches) {
        console.log('Matches encontrados:', matches);
        const [_, balance, entity, type, dateStr] = matches;
        
        // Convertir fecha al formato requerido
        const [date, time] = dateStr.split(' ');
        const [day, month, year] = date.split('/');
        const formattedDate = `${year}-${month}-${day}T${time}:00`;

        // Limpiar y normalizar los valores
        const cleanEntity = entity.trim();
        const cleanType = type.trim();

        // Agregar tipos únicos a los sets
        movementTypeSet.add(cleanType);
        entitySet.add(cleanEntity);

        // Crear item
        items.push({
          Date: formattedDate,
          Id: "0",
          Type: cleanType,
          Entity: cleanEntity,
          Place: cleanEntity,
          BalanceFormat: `$ ${balance.trim()}`,
          ValueFormat: `$ ${balance.trim()}`,
          IsNegative: balance.startsWith('-'),
          IsNegativeBalance: false
        });
      }
    }

    // Crear la estructura final
    return {
      Success: true,
      Message: "",
      Data: {
        Count: items.length,
        PageSize: 0,
        CurrentPage: 0,
        PageCount: 0,
        Items: items,
        EntityList: Array.from(entitySet),
        MovementTypeList: Array.from(movementTypeSet)
      },
      Code: "",
      HttpStatusCode: 200
    };
  };

  const handleFile = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;

    const fileReader = new FileReader();

    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);

      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      console.log({pdf})
      let finalText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        console.log('Contenido de página:', content);

        // Ordenar los elementos por posición Y y luego X
        const items = content.items.sort((a, b) => {
          if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
            // Si están en la misma línea aproximadamente (diferencia menor a 5 unidades)
            return a.transform[4] - b.transform[4]; // Ordenar por posición X
          }
          return b.transform[5] - a.transform[5]; // Ordenar por posición Y (invertido porque Y crece hacia abajo)
        });

        let lastY = null;
        let lineText = '';
        let pageText = '';

        // Procesar cada elemento de texto
        items.forEach(item => {
          const currentY = Math.round(item.transform[5]);
          
          // Si es una nueva línea (Y diferente)
          if (lastY !== null && Math.abs(currentY - lastY) > 5) {
            pageText += lineText.trim() + '\n';
            lineText = '';
          }
          
          lineText += item.str + ' ';
          lastY = currentY;
        });

        // Agregar la última línea
        if (lineText.trim()) {
          pageText += lineText.trim() + '\n';
        }

        console.log('Texto procesado de la página:', pageText);
        finalText += pageText + '\n';
      }

      setText(finalText);
      const processedData = processText(finalText);
      if (processedData) {
        console.log('Objeto formado:', processedData);
        setFileContent(processedData);
      }
    };

    fileReader.readAsArrayBuffer(file);
  };

  return (
    <div>
      {!fileContent ? (
        <>
          <input type="file" accept="application/pdf" onChange={handleFile} />
          <pre>{text}</pre>
        </>
      ) : (
        <MainData setIsValid={() => {}} file={fileContent} setFileContent={setFileContent} />
      )}
    </div>
  );
}

export default PdfReader;