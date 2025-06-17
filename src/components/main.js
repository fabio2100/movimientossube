import { useState } from "react";
import MainData from "./mainData";
import { Button } from "@mui/material";
import JsonFileUpload from "./JsonFileUpload";
import PdfReader from "./PdfReader";

export default function Main() {
  const [isValid, setIsValid] = useState(false);
  const [fileContent, setFileContent] = useState(null);

  const uploadFile = () => {
    return (
      <div className="mainBotonera">
        <JsonFileUpload
          setFileContent={setFileContent}
          fileContent={fileContent}
          setIsValid={setIsValid}
          isValid={isValid}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setIsValid(!isValid);
          }}
        >
          Ver ejemplo
        </Button>
        <PdfReader />
      </div>
    );
  };
  return <>{isValid ? <MainData setIsValid={setIsValid} /> : uploadFile()}</>;
}
