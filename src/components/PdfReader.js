import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min';




function PdfReader() {
  const [text, setText] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;

    const fileReader = new FileReader();

    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);

      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      let finalText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        finalText += pageText + '\n';
      }

      setText(finalText);
      console.log(finalText)
    };

    fileReader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFile} />
      <pre>{text}</pre>
    </div>
  );
}

export default PdfReader;