import { Button } from '@mui/material';
import React, { useState } from 'react';
import MainData from './mainData';

function JsonFileUpload({setFileContent,fileContent,setIsValid,isValid}) {

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
      {!fileContent ? 
      <Button fullWidth variant="outlined" sx={{marginBottom:1}}><input type="file" accept=".json" onChange={handleFileChange} /></Button> :
      <MainData setIsValid={setIsValid} file={fileContent} setFileContent={setFileContent} /> } 
    </div>
  );
}

export default JsonFileUpload;
