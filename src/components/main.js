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
  const [dataPreciosUsados, setDataPreciosUsados] = useState([]);
  const [cantidadPreciosUsados, setCantidadPreciosUsados] = useState([]);
  const [fechasMes, setFechasMes] = useState([]);
  const [balancesMes, setBalancesMes] = useState([]);
  const [longitudLineChart,setLongitudLineChart] = useState(0);
  const [fechaMes2,setFechaMes2] = useState([]);
  const [balancesMes2, setBalancesMes2] = useState([]);
  const [longitudLineChart2,setLongitudLineChart2] = useState(0);
  const [dataMes,setDataMes] = useState({});
  const [mesProvisorio,setMesProvisorio] = useState([]);
  const [mesProvisorioTotales,setMesProvisorioTotales] = useState([]);
  const [viajeTotales,setViajesTotales] = useState(0);
  const [cargaMesTotales,setCargaMesTotales] = useState(0);
  const [serviciosTotalesMes,setServiciosTotalesMes] = useState(0);
  const [allMesData, setAllMesData] = useState({
    nroMovimientos: 0,
    nroServicios: 0,
    nroCargas: 0,
    saldoCargado: 0,
    saldoConsumido: 0,
    avgViaje: 0
  })


  const handleChange = (event) => {
    setMes(event.target.value);
  };

  useEffect(() => {
    let arrayProvisorio = [];
    let totalMovimientosMes = 0;
    setCargaMes(0);
    setDineroCargado(0);
    setSaldoConsumido(0);
    setMesProvisorioTotales(Uno.Data.Items.filter((item)=>{
      const fecha = new Date(item.Date);
      return fecha.getMonth() + 1 === mes || mes ==='all'
    }))

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
    setMesProvisorio(arrayProvisorio)
    setTotalViajesMes(arrayProvisorio.length);
    setAvgViaje(saldoConsumido / totalViajesMes);
    setLongitudLineChart(totalViajesMes*10);
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
    setLongitudLineChart2(0)
    let arrayBalances = [];
    let arrayFechas = [];
    arrayProvisorio.forEach((item) => {
      arrayBalances.push(item.ValueFormat.slice(2).replace(",", "."));
      arrayFechas.push(new Date(item.Date));
      setFechaMes2([...fechaMes2,item.Date])
      setBalancesMes2([...balancesMes2,item.ValueFormat.slice(2).replace(",", ".")])
      setLongitudLineChart2(prev => prev + 10)
    });
    arrayBalances = arrayBalances.reverse();
    arrayFechas = arrayFechas.reverse();
    setFechasMes(arrayFechas);
    setBalancesMes(arrayBalances);
  },[mes]);

  useEffect(()=>{

    function saldoSumadora(prev,item){
      const value = item.Type !== 'Carga virtual' ? Math.abs(Number(item.BalanceFormat.slice(2).replace(",", "."))) : 0;
      return  prev + value
    }
    function saldoCargadora(prev,item){
      const value = item.Type === 'Carga virtual' ? Math.abs(Number(item.BalanceFormat.slice(2).replace(",", "."))) : 0;
      return  prev + value
    }
    const nroCargas = mesProvisorioTotales.filter(item => item.Type === 'Carga virtual').length;
    const nroMovimientos =  mesProvisorioTotales.length;
    const nroServicios = nroMovimientos - nroCargas;
    const saldoConsumido = mesProvisorioTotales.reduce(saldoSumadora,0)
    const avgViaje = saldoConsumido/nroServicios
    const saldoCargado = mesProvisorioTotales.reduce(saldoCargadora,0)

    setAllMesData({...allMesData,
      nroMovimientos,
      nroCargas,
      nroServicios,
      saldoConsumido,
      avgViaje,
      saldoCargado
    })
  },[mesProvisorioTotales])



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
      <p>array USANDO ARRAY PROVISORIO</p>
      {arrayDataMes}
      <p>Movimientos totales mes: {allMesData['nroMovimientos']}</p>
      <p>Servicios totales mes: {allMesData['nroServicios']}</p>
      <p>Cargas totales mes: {allMesData['nroCargas']}</p>
      <p>Saldo Cargado: $ {allMesData['saldoCargado'].toFixed(2)}</p>
      <p>Saldo Consumido: $ {allMesData['saldoConsumido'].toFixed(2)}</p>
      <p>Promedio por viaje: $ {allMesData['avgViaje'].toFixed(2)}</p>
      <p>array data mes</p>
      {arrayDataMes}
      <p>Viajes totales mes: {totalViajesMes}</p>
      <p>Cargas totales mes: {cargaMes}</p>
      <p>Saldo Cargado: {dineroCargado}</p>
      <p>Saldo Consumido: {saldoConsumido}</p>
      <p>Promedio por viaje: {avgViaje}</p>

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

      <div className="lineChart">
        <h2>Evolución del saldo</h2>
        <LineChart
          grid={{ vertical: true, horizontal: true }}
          xAxis={[{ data: fechaMes2, valueFormatter }]}
          series={[
            {
              data: balancesMes2,
            },
          ]}
          width={longitudLineChart2}
          height={300}
        />
      </div>
    </>
  );
}
