import { BarChart, LineChart, PieChart, SparkLineChart } from "@mui/x-charts";
import Uno from "../movimientos/060824.json";
import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { useState } from "react";
//Estructura
/*{
    Success: true,
    Message: '',
    Data: {
      Count: 165,
      PageSize: 0,
      CurrentPage: 0,
      PageCount: 0,
      Items => Movimientos concretos,
      Message: '',
      EntityList: => Parece ser que son las categorías de Items.entity,
      MovementTypeList: => tipo de movimientos 
    },
    Code: '',
    HttpStatusCode: 200
  }*/

export default function Main() {
  const [mes,setMes] = useState('all');
  const [arrayDataMes,setArrayDataMes] = useState([])

  const handleChange = (event) => {
    console.log(event.target.value)
    setMes(event.target.value)
    let arrayProvisorio = [];
    console.log(mes)
    Uno.Data.Items.forEach(item => {
      const fecha = new Date(item.Date);
      console.log(fecha.getMonth())
      if(fecha.getMonth() == mes){
        arrayProvisorio.push(item)
      }
    })
    console.log({arrayProvisorio})
    //setArrayDataMes(arrayProvisorio)
  }

  

  const inputSelect  = <FormControl sx={{ m: 1, minWidth: 200 }}>
    <InputLabel id="demo-simple-select-label">Mes
    </InputLabel>
    <Select
     labelId="demo-simple-select-label"
     id="demo-simple-select"
     value={mes}
     label="Mes"
     onChange={handleChange}
    >
      <MenuItem value={'all'}>Todos los datos</MenuItem>
      <MenuItem value={1}>Enero</MenuItem>
      <MenuItem value={2}>Febrero</MenuItem>
      <MenuItem value={3}>Marzo</MenuItem>
      <MenuItem value={4}>Abril</MenuItem>
      <MenuItem value={5}>Mayo</MenuItem>
      <MenuItem value={6}>junio</MenuItem>
      <MenuItem value={7}>Julio</MenuItem>
      <MenuItem value={8}>Agosto</MenuItem>
      <MenuItem value={9}>Setiembre</MenuItem>
      <MenuItem value={10}>Octubre</MenuItem>
      <MenuItem value={11}>Noviembre</MenuItem>
      <MenuItem value={12}>Diciembre</MenuItem>
    </Select>
  </FormControl>


  let arrayServicios = [];
  const lineasUsadas = Uno.Data.EntityList.map((linea) => {
    let contador = 0;
    Uno.Data.Items.forEach((movimiento) => {
      movimiento.Entity == linea && contador++;
    });
      arrayServicios.push({ id: linea, label: linea, value: contador });
    return (
      <p>
        {linea} Veces:{contador}
      </p>
    );
  });

  let arrayTipos = [];
  let arrayTiposBarChart = [];

  const tipoDeMovimiento = Uno.Data.MovementTypeList.map((tipoMovimiento,index) => {
    let contador = 0;
    Uno.Data.Items.forEach((movimiento) => {
      tipoMovimiento == movimiento.Type && contador++;
    });
    arrayTipos.push({
      id: tipoMovimiento,
      label: tipoMovimiento,
      value: contador,
    });
    arrayTiposBarChart.push(contador)
    return (
      <p>
        {tipoMovimiento} : {contador}
      </p>
    );
  });

  let arrayBalances = [];
  let arrayFechas = [];
  Uno.Data.Items.forEach((item) => {
    arrayBalances.push(item.ValueFormat.slice(2).replace(",", "."));
    arrayFechas.push(new Date(item.Date))
  });
  arrayBalances = arrayBalances.reverse();
  arrayFechas = arrayFechas.reverse();



  var options = { month: 'short', day: 'numeric' ,hour:'numeric',minute:'numeric',seconds:'numeric'};
  const valueFormatter = (fecha) => fecha.toLocaleString("es-ES",options)
  return (
    <>
    {inputSelect}
    <h1>array data mes</h1>
    {arrayDataMes}
    <div className="lineChart">
      <LineChart 
       grid={{ vertical: true, horizontal: true }}
       xAxis={[{ data: arrayFechas,valueFormatter }]}
      series={[{
        data: arrayBalances
      }]}
      width={1500}
      height={300}
      />
</div>
      <BarChart
      yAxis={[{scaleType:'band',data:Uno.Data.MovementTypeList}]}
      series={[{data:arrayTiposBarChart}]}
      width={500}
      height={300}
      layout="horizontal"
    
      />
        
      <PieChart
        slotProps={{
          legend: {
            direction: "row",
            position: { vertical: "top", horizontal: "middle" },
            padding: 0,
          },
        }}
        series={[
          {
            data: arrayServicios,
            highlightScope: { faded: "global", highlighted: "item" },
            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
            innerRadius: 30,
          },
        ]}
        width={500}
        height={300}
      />

    </>
  );
}
