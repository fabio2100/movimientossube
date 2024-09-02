import { BarChart, PieChart } from "@mui/x-charts";
import Uno from "../movimientos/total082024.json";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
  const [mesProvisorioTotales, setMesProvisorioTotales] = useState([]);
  const [allMesData, setAllMesData] = useState({
    nroMovimientos: 0,
    nroServicios: 0,
    nroCargas: 0,
    saldoCargado: 0,
    saldoConsumido: 0,
    avgViaje: 0,
    arrServiciosXMes: {},
    objPrecios: {},
    objEvolucionSaldo: {},
  });

  const handleChange = (event) => {
    setMes(event.target.value);
  };

  useEffect(() => {
    setMesProvisorioTotales(
      Uno.Data.Items.filter((item) => {
        const fecha = new Date(item.Date);
        return fecha.getMonth() + 1 === mes || mes === "all";
      })
    );

  }, [mes]);

  useEffect(() => {
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

    const evolucionFechasSaldo = [];
    const evolucionSaldos = [];

    mesProvisorioTotales.forEach((item) => {
      evolucionFechasSaldo.push(new Date(item.Date));
      evolucionSaldos.push(Number(item.ValueFormat.slice(2).replace(",", ".")));
    });

    /*arrayProvisorio.forEach((item) => {
      arrayBalances.push(item.ValueFormat.slice(2).replace(",", "."));
      arrayFechas.push(new Date(item.Date));
      setFechaMes2([...fechaMes2,item.Date])
      setBalancesMes2([...balancesMes2,item.ValueFormat.slice(2).replace(",", ".")])
      setLongitudLineChart2(prev => prev + 10)
    });*/

    setAllMesData({
      ...allMesData,
      nroMovimientos,
      nroCargas,
      nroServicios,
      saldoConsumido,
      avgViaje,
      saldoCargado,
      arrServiciosXMes,
      objPrecios: { preciosArray, cantidadPreciosArray },
      objEvolucionSaldo: { evolucionFechasSaldo, evolucionSaldos },
    });

  }, [mesProvisorioTotales]);

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



  return (
    <>
      {inputSelect}
      <p>Movimientos totales mes: {allMesData["nroMovimientos"]}</p>
      <p>Servicios totales mes: {allMesData["nroServicios"]}</p>
      <p>Cargas totales mes: {allMesData["nroCargas"]}</p>
      <p>Saldo Cargado: $ {allMesData["saldoCargado"].toFixed(2)}</p>
      <p>Saldo Consumido: $ {allMesData["saldoConsumido"].toFixed(2)}</p>
      <p>Promedio por viaje: $ {allMesData["avgViaje"].toFixed(2)}</p>

      <h2>Servicios</h2>
      {allMesData["arrServiciosXMes"].length && (
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
