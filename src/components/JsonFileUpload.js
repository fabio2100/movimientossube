import { Button } from '@mui/material';
import React, { useRef, useState } from 'react';

function JsonFileUpload({setFileContent,fileContent,setIsValid,isValid}) {
  const fileInputRef = useRef(null);

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

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input 
        type="file" 
        accept=".json" 
        onChange={handleFileChange} 
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <Button 
        fullWidth 
        variant="outlined" 
        onClick={handleButtonClick}
      >
        Subir JSON
      </Button>
    </>
  );
}

export default JsonFileUpload;
