import { BarChart, LineChart, PieChart, SparkLineChart } from "@mui/x-charts";
import Uno from "../movimientos/total082024.json";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
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
  const [mes, setMes] = useState("all");
  const [arrayDataMes, setArrayDataMes] = useState([]);
  const [arrayServiciosMes, setArrayServiciosMes] = useState([]);
  const [totalViajesMes, setTotalViajesMes] = useState(0);
  const [cargaMes, setCargaMes] = useState(0);
  const [dineroCargado, setDineroCargado] = useState(0);
  const [saldoConsumido, setSaldoConsumido] = useState(0);
  const [avgViaje, setAvgViaje] = useState(0);
  const [ejeY, setEjeY] = useState(false);
  const [ejeX, setEjeX] = useState(false);
  const [dataPreciosUsados, setDataPreciosUsados] = useState([]);
  const [cantidadPreciosUsados, setCantidadPreciosUsados] = useState([]);
  const [fechasMes, setFechasMes] = useState([]);
  const [balancesMes, setBalancesMes] = useState([]);
  const [longitudLineChart,setLongitudLineChart] = useState(0);


  const handleChange = (event) => {
    setMes(event.target.value);
  };

  useEffect(() => {
    let arrayProvisorio = [];
    let totalMovimientosMes = 0;
    setCargaMes(0);
    setDineroCargado(0);
    setSaldoConsumido(0);
    Uno.Data.Items.forEach((item) => {
      totalMovimientosMes++;
      const fecha = new Date(item.Date);
      if (fecha.getMonth() + 1 == mes || mes === "all") {
        if (item.Type !== "Carga virtual") {
          arrayProvisorio.push(item);
          setSaldoConsumido(
            (prev) =>
              prev + Number(item.BalanceFormat.slice(2).replace(",", "."))
          );
        }
        if(item.Type === 'Carga virtual'){
          setCargaMes((prev) => prev + 1);
          setDineroCargado(
            (prev) =>
              prev + Number(item.BalanceFormat.slice(2).replace(",", "."))
          );
        }
      }
    });
    setTotalViajesMes(arrayProvisorio.length);
    setAvgViaje(saldoConsumido / totalViajesMes);
    setLongitudLineChart(totalViajesMes*10);
    console.log(totalMovimientosMes)
    console.log(longitudLineChart)
    let arrayServicios = [];
    Uno.Data.EntityList.forEach((linea) => {
      let contador = 0;
      arrayProvisorio.forEach((movimiento) => {
        if (movimiento.Entity == linea) {
          contador++;
        }
      });

      contador > 0 &&
        arrayServicios.push({ id: linea, label: linea, value: contador });
    });
    setArrayServiciosMes(arrayServicios);
    let arrayTipoMes = [];
    Uno.Data.MovementTypeList.forEach((tipo) => {
      arrayTipoMes.push(tipo);
      arrayProvisorio.forEach((viajeMes) => {
        if (viajeMes.Type === tipo) {
        }
      });
    });

    let arrayPreciosUsados = [];
    let arrayCantidadPreciosUsados = [];
    arrayProvisorio.forEach((element) => {
      if (arrayPreciosUsados.indexOf(element.BalanceFormat) == -1) {
        arrayPreciosUsados.push(element.BalanceFormat);
        arrayCantidadPreciosUsados.push(1);
      } else {
        arrayCantidadPreciosUsados[
          arrayPreciosUsados.indexOf(element.BalanceFormat)
        ] =
          arrayCantidadPreciosUsados[
            arrayPreciosUsados.indexOf(element.BalanceFormat)
          ] + 1;
      }
    });
    setDataPreciosUsados(arrayPreciosUsados);
    setCantidadPreciosUsados(arrayCantidadPreciosUsados);

    let arrayBalances = [];
    let arrayFechas = [];
    arrayProvisorio.forEach((item) => {
      arrayBalances.push(item.ValueFormat.slice(2).replace(",", "."));
      arrayFechas.push(new Date(item.Date));
    });
    arrayBalances = arrayBalances.reverse();
    arrayFechas = arrayFechas.reverse();
    setFechasMes(arrayFechas);
    setBalancesMes(arrayBalances);
  }, [mes]);

  const inputSelect = (
    <FormControl sx={{ m: 1, minWidth: 200 }}>
      <InputLabel id="demo-simple-select-label">Mes</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={mes}
        label="Mes"
        onChange={handleChange}
      >
        <MenuItem value={"all"}>Todos los datos</MenuItem>
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
  );

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

  const tipoDeMovimiento = Uno.Data.MovementTypeList.map(
    (tipoMovimiento, index) => {
      let contador = 0;
      Uno.Data.Items.forEach((movimiento) => {
        tipoMovimiento == movimiento.Type && contador++;
      });
      arrayTipos.push({
        id: tipoMovimiento,
        label: tipoMovimiento,
        value: contador,
      });
      arrayTiposBarChart.push(contador);
      return (
        <p>
          {tipoMovimiento} : {contador}
        </p>
      );
    }
  );

  let arrayBalances = [];
  let arrayFechas = [];
  Uno.Data.Items.forEach((item) => {
    arrayBalances.push(item.ValueFormat.slice(2).replace(",", "."));
    arrayFechas.push(new Date(item.Date));
  });
  arrayBalances = arrayBalances.reverse();
  arrayFechas = arrayFechas.reverse();
  console.log({ arrayFechas });
  console.log({ arrayBalances });

  var options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    seconds: "numeric",
  };
  const valueFormatter = (fecha) => fecha.toLocaleString("es-ES", options);
  return (
    <>
      {inputSelect}
      <h1>array data mes</h1>
      {arrayDataMes}
      <h1>Viajes totales mes: {totalViajesMes}</h1>
      <h1>Cargas totales mes: {cargaMes}</h1>
      <h1>Saldo Cargado: {dineroCargado}</h1>
      <h1>Saldo Consumido: {saldoConsumido}</h1>
      <h1>Promedio por viaje: {avgViaje}</h1>

      <h2>Por sevicio utlizado</h2>
      <PieChart
        slotProps={{
          legend: {
            direction: "row",
            position: { vertical: "bottom", horizontal: "right" },
            padding: 0,
          },
        }}
        series={[
          {
            data: arrayServiciosMes,
            highlightScope: { faded: "global", highlighted: "item" },
            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
            innerRadius: 30,
          },
        ]}
        width={500}
        height={300}
      />
      <h2>Por precio del pasaje</h2>
      <BarChart
        yAxis={[{ scaleType: "band", data: dataPreciosUsados }]}
        series={[{ data: cantidadPreciosUsados }]}
        width={500}
        height={300}
        layout="horizontal"
      />

      <div className="lineChart">
        <h2>Evolución del saldo</h2>
        <LineChart
          grid={{ vertical: true, horizontal: true }}
          xAxis={[{ data: fechasMes, valueFormatter }]}
          series={[
            {
              data: balancesMes,
            },
          ]}
          width={longitudLineChart}
          height={300}
        />
      </div>
    </>
  );
}
