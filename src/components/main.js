import { useState } from "react";
import MainData from "./mainData";
import { Button, Box, Grid } from "@mui/material";
import JsonFileUpload from "./JsonFileUpload";
import PdfReader from "./PdfReader";

export default function Main() {
  const [isValid, setIsValid] = useState(false);
  const [fileContent, setFileContent] = useState(null);

  const uploadFile = () => {
    return (
      <div className="mainBotonera">
        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          <Grid item xs={6}>
            <JsonFileUpload
              setFileContent={setFileContent}
              fileContent={fileContent}
              setIsValid={setIsValid}
              isValid={isValid}
            />
          </Grid>
          <Grid item xs={6}>
            <PdfReader 
              setFileContent={setFileContent}
              fileContent={fileContent}
            />
          </Grid>
        </Grid>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            setIsValid(!isValid);
          }}
        >
          Ver ejemplo
        </Button>
      </div>
    );
  };
  return <>{(isValid || fileContent) ? <MainData setIsValid={setIsValid} file={fileContent} setFileContent={setFileContent} /> : uploadFile()}</>;
}
