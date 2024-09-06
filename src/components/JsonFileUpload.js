import { Button } from '@mui/material';
import React, { useState } from 'react';

function JsonFileUpload({setFileContent,fileContent}) {

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      try {
        const json = JSON.parse(content);
        setFileContent(json);
      } catch (error) {
        console.error('Error al parsear el JSON:', error);
      }
    };

    if (file) {
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <Button variant="outlined"><input type="file" accept=".json" onChange={handleFileChange} /></Button>
    </div>
  );
}

export default JsonFileUpload;
