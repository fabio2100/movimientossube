import { BarChart, LineChart, PieChart, SparkLineChart } from "@mui/x-charts";
import Uno from "../movimientos/250724.json";
import { Box, Stack } from "@mui/material";
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
  let arrayServicios = [{ id: "otros", label: "Menos de 3 viajes", value: 0 }];
  const indexOtros = arrayServicios.findIndex((obj) => (obj.id = "otros"));
  const lineasUsadas = Uno.Data.EntityList.map((linea) => {
    let contador = 0;
    Uno.Data.Items.forEach((movimiento) => {
      movimiento.Entity == linea && contador++;
    });
    if (contador <= 3) {
      arrayServicios[indexOtros].value += contador;
      arrayServicios[
        indexOtros
      ].label = `${arrayServicios[indexOtros].label} ${linea}`;
    } else {
      arrayServicios.push({ id: linea, label: linea, value: contador });
    }
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
        series={[
          {
            data: arrayTipos,
            highlightScope: { faded: "global", highlighted: "item" },
            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
            innerRadius: 30,
          
          },
        ]}
        width={500}
        height={200}
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

      <h3>Total de movimientos {Uno.Data.Count}</h3>
      <h2>Segun medio utilizado</h2>
      {lineasUsadas}
      <h2>Tipos de movimientos</h2>
      {tipoDeMovimiento}
    </>
  );
}
