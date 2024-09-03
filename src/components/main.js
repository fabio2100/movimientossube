import { BarChart, PieChart } from "@mui/x-charts";
import Uno from "../movimientos/total082024.json";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
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
  const [mesProvisorioTotales, setMesProvisorioTotales] = useState([]);
  const [infoTotales, setInfoTotales] = useState([]);
  const [allMesData, setAllMesData] = useState({
    nroMovimientos: 0,
    nroServicios: 0,
    nroCargas: 0,
    saldoCargado: 0,
    saldoConsumido: 0,
    avgViaje: 0,
    arrServiciosXMes: {},
    arrServiciosXMesOrdenados: {},
    objPrecios: {},
  });

  const [elementIsVisible,setElementIsVisible] = useState(false);

  useEffect(() => {
    const countByMonth = () => {
      const data = Uno.Data.Items;
      const result = {};
      const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      data.forEach((item) => {
        if (item.Type !== "Carga virtual") {
          const month = new Date(item.Date).getMonth(); // Obtener el mes (0-11) y ajustar a (1-12)
          const balance = Math.abs(
            Number(item.BalanceFormat.slice(2).replace(",", "."))
          );
          if (result[month]) {
            result[month].cantidad++;
            result[month].saldoConsumido += balance;
          } else {
            result[month] = {
              mes: month + 1,
              cantidad: 1,
              nombre: monthNames[month],
              saldoConsumido: balance,
            };
          }
        }
      });

      return Object.values(result);
    };
    setInfoTotales(countByMonth());
  }, []);

  const handleChange = (event) => {
    setMes(event.target.value);
  };

  const handleElIsVisible = () => {
    setElementIsVisible(!elementIsVisible)
  }

  useEffect(() => {
    setMesProvisorioTotales(
      Uno.Data.Items.filter((item) => {
        const fecha = new Date(item.Date);
        return fecha.getMonth() + 1 === mes || mes === "all";
      })
    );
  }, [mes]);

  useEffect(() => {
    console.log({ infoTotales });
    function saldoSumadora(prev, item) {
      const value =
        item.Type !== "Carga virtual"
          ? Math.abs(Number(item.BalanceFormat.slice(2).replace(",", ".")))
          : 0;
      return prev + value;
    }
    function saldoCargadora(prev, item) {
      const value =
        item.Type === "Carga virtual"
          ? Math.abs(Number(item.BalanceFormat.slice(2).replace(",", ".")))
          : 0;
      return prev + value;
    }
    const nroCargas = mesProvisorioTotales.filter(
      (item) => item.Type === "Carga virtual"
    ).length;
    const nroMovimientos = mesProvisorioTotales.length;
    const nroServicios = nroMovimientos - nroCargas;
    const saldoConsumido = mesProvisorioTotales.reduce(saldoSumadora, 0);
    const avgViaje = saldoConsumido / nroServicios;
    const saldoCargado = mesProvisorioTotales.reduce(saldoCargadora, 0);

    const arrServiciosXMes = mesProvisorioTotales.reduce((acc, item) => {
      if (item.Type !== "Carga virtual") {
        const found = acc.find((el) => el.id === item.Entity);
        if (found) {
          found.value++;
        } else {
          acc.push({ id: item.Entity, label: item.Entity, value: 1 });
        }
      }
      return acc;
    }, []);

    const preciosArray = [];
    const cantidadPreciosArray = [];

    mesProvisorioTotales
      .reduce((acc, item) => {
        if (item.Type !== "Carga virtual") {
          const found = acc.find((el) => el.precio === item.BalanceFormat);
          if (found) {
            found.total++;
          } else {
            acc.push({ precio: item.BalanceFormat, total: 1 });
          }
        }
        return acc;
      }, [])
      .forEach((item) => {
        preciosArray.push(item.precio);
        cantidadPreciosArray.push(item.total);
      });

    const arrServiciosXMesOrdenados = arrServiciosXMes.sort((a,b)=> b.value - a.value)

    setAllMesData({
      ...allMesData,
      nroMovimientos,
      nroCargas,
      nroServicios,
      saldoConsumido,
      avgViaje,
      saldoCargado,
      arrServiciosXMes,
      arrServiciosXMesOrdenados,
      objPrecios: { preciosArray, cantidadPreciosArray },
    });
  }, [mesProvisorioTotales]);

  const rankingServicios = allMesData.arrServiciosXMes.length>0 ?
   allMesData.arrServiciosXMes.map((servicio,index) => {
    const percentaje = (100*servicio.value/allMesData.nroServicios).toFixed(0)
    const elementStyle = (index < 5 || index>5 && elementIsVisible) ? {width:`${percentaje}%`,overflowX:'visible' } : {width:`${percentaje}%`,overflowX:'visible',display: 'none' }
     return <li className="li-marker" key={servicio.id} style={elementStyle}><span>{servicio.label}</span> <span>{servicio.value} veces</span> <span> {percentaje}%</span></li>
  }) : "";
 
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
        {infoTotales.map((dataMes) => (
          <MenuItem key={dataMes.mes} value={dataMes.mes}>{dataMes.nombre}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <>
  

  
      <BarChart
        width={500}
        height={300}
        dataset={infoTotales}
        series={[{ dataKey: "cantidad", label: "Cantidad de servicios" }]}
        xAxis={[{ scaleType: "band", dataKey: "nombre" }]}

      />

      <BarChart
        width={500}
        height={300}
        dataset={infoTotales}
        series={[{ dataKey: "saldoConsumido", label: "Saldo consumido" ,valueFormatter: item => `$ ${item}` }]}
        xAxis={[{ scaleType: "band", dataKey: "nombre" }]}
      />

      {inputSelect}
      
      <ul>
        <li>
          <span>{allMesData["nroMovimientos"]}</span>
          <span>Movimientos totales</span>
        </li>
        <li>
          <span>{allMesData["nroServicios"]}</span>
          <span>Servicios totales</span>
        </li>
        <li>
          <span>$ {allMesData["saldoConsumido"].toFixed(2)}</span>
          <span>Saldo consumido</span>
        </li>
        <li>
          <span>{allMesData["nroCargas"]}</span>
          <span>Número de cargas</span>
        </li>
        <li>
          <span>$ {allMesData["saldoCargado"].toFixed(2)}</span>
          <span>Saldo cargado</span>
        </li>
        <li>
          <span> $ {allMesData["avgViaje"].toFixed(2)}</span>
          <span>Promedio por viaje</span>
        </li>
      </ul>

      <h2>Servicios</h2>
      {allMesData["arrServiciosXMes"].length && <ul> {rankingServicios} </ul>}
      {rankingServicios.length > 5 && <button onClick={handleElIsVisible}>Ver más</button>}
      {allMesData["arrServiciosXMes"].length && 
      
      (
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
              data: allMesData["arrServiciosXMes"],
              highlightScope: { faded: "global", highlighted: "item" },
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
              innerRadius: 30,
            },
          ]}
          width={500}
          height={300}
        />
      )}

      <h2>Por precio del pasaje</h2>
      {Object.keys(allMesData.objPrecios).length !== 0 && (
        <BarChart
          yAxis={[
            { scaleType: "band", data: allMesData.objPrecios.preciosArray },
          ]}
          series={[{ data: allMesData.objPrecios.cantidadPreciosArray }]}
          width={500}
          height={300}
          layout="horizontal"
        />
      )}

    </>
  );
}
