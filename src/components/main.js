import { PieChart } from "@mui/x-charts";
import Uno from "../movimientos/dos.json";
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
  const tipoDeMovimiento = Uno.Data.MovementTypeList.map((tipoMovimiento) => {
    let contador = 0;
    Uno.Data.Items.forEach((movimiento) => {
      tipoMovimiento == movimiento.Type && contador++;
    });
    arrayTipos.push({
      id: tipoMovimiento,
      label: tipoMovimiento,
      value: contador,
    });
    return (
      <p>
        {tipoMovimiento} : {contador}
      </p>
    );
  });
  return <>
    <PieChart
  series={[
    {
      data: arrayTipos,
      highlightScope: { faded: 'global', highlighted: 'item' },
      faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
      innerRadius: 30,
    },
  ]}
  width={800}
  height={200}
/>
<PieChart
slotProps={{
  legend: {
    direction: 'row',
    position: { vertical: 'top', horizontal: 'middle' },
    padding: 0,
  },
}}
  series={[
    {
      data: arrayServicios,
      highlightScope: { faded: 'global', highlighted: 'item' },
      faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
      innerRadius: 30,
    },
  ]}
  
  width={1000}
  height={300}
/>
     <h3>Total de movimientos {Uno.Data.Count}</h3>
     <h2>Segun medio utilizado</h2>
     {lineasUsadas}
     <h2>Tipos de movimientos</h2>
     {tipoDeMovimiento}
  </>;
}
