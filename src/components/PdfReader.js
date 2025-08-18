import React, { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min';
import { Button } from '@mui/material';

function PdfReader({ setFileContent, fileContent }) {
  const [text, setText] = useState('');
  const [localFileContent, setLocalFileContent] = useState(null);
  const fileInputRef = useRef(null);

  const processText = (text) => {
    console.log('Texto recibido para procesar:', text);
    // Dividir el texto en líneas
    const lines = text.split('\n').filter(line => line.trim());
    
    // Procesar las líneas de la tabla
    const items = [];
    const entitySet = new Set();
    const movementTypeSet = new Set();

    // Expresión regular para extraer los datos de cada línea
    // Patrón: fecha hora tipo_transaccion [LINEA entity] $ valor
    const regexPattern = /^(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+(.+?)\s+\$\s*([-\d,.]+)$/;

    for (const line of lines) {
      console.log('Procesando línea:', line);
      // Ignorar líneas de encabezado y pie de página
      if (line.includes('Página') || line.includes('Movimientos registrados') || !line.trim()) {
        continue;
      }

      const matches = line.match(regexPattern);
      if (matches) {
        console.log('Matches encontrados:', matches);
        const [_, date, time, transactionPart, value] = matches;
        
        // Convertir fecha al formato requerido
        const [day, month, year] = date.split('/');
        const formattedDate = `${year}-${month}-${day}T${time}:00`;

        // Procesar la parte de la transacción para extraer tipo y entidad
        let type = '';
        let entity = '';
        
        // Buscar si contiene "LINEA" para extraer la entidad
        const lineaMatch = transactionPart.match(/(.+?)\s+LINEA\s+(\d+)\s+(?:\d+\s*)?/);
        if (lineaMatch) {
          type = lineaMatch[1].trim();
          entity = `LINEA ${lineaMatch[2]}`;
        } else {
          // Si no tiene LINEA, todo es el tipo de transacción
          type = transactionPart.trim();
          entity = '';
        }

        // Procesar el valor - extraer exactamente como aparece en el string original
        const finalValue = `$ ${value}`;

        // Agregar tipos únicos a los sets
        movementTypeSet.add(type);
        if (entity) {
          entitySet.add(entity);
        }

        // Crear item
        items.push({
          Date: formattedDate,
          Id: "0",
          Type: type,
          Entity: entity || type,
          Place: entity || type,
          BalanceFormat: finalValue,
          ValueFormat: finalValue,
          IsNegative: value.includes('-'),
          IsNegativeBalance: false
        });
        
        console.log('Item creado:', {
          Date: formattedDate,
          Type: type,
          Entity: entity || type,
          Value: value,
          BalanceFormat: finalValue
        });
      } else {
        console.log('No match para línea:', line);
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

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleFile} 
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <Button 
        fullWidth 
        variant="outlined" 
        onClick={handleButtonClick}
      >
        Subir PDF
      </Button>
    </>
  );
}

export default PdfReader;