import { BarChart, ContinuousColorLegend, LineChart, PieChart } from "@mui/x-charts";
import example from "../movimientos/total082024.json";
import example2 from "../movimientos/subeDigital.json";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  AddCircleOutlineRounded,
  RemoveCircleOutline,
} from "@mui/icons-material";
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

export default function MainData({ setIsValid, file = 0, setFileContent }) {
  //const exampleAlter = isAlterArray(example);
  const exampleAlter = example;

  const mainFile = file || exampleAlter;
  const [mes, setMes] = useState("all");
  const [mesProvisorioTotales, setMesProvisorioTotales] = useState([]);
  const [infoTotales, setInfoTotales] = useState([]);
  const [allMesData, setAllMesData] = useState({
    monthNames: [
      ["Ene", "Enero", 31],
      ["Feb", "Febrero", 29],
      ["Mar", "Marzo", 31],
      ["Abr", "Abril", 30],
      ["May", "Mayo", 31],
      ["Jun", "Junio", 30],
      ["Jul", "Julio", 31],
      ["Ago", "Agosto", 31],
      ["Set", "Septiembre", 30],
      ["Oct", "Octubre", 31],
      ["Nov", "Noviembre", 30],
      ["Dic", "Diciembre", 31],
    ],
    nroMovimientos: 0,
    nroServicios: 0,
    nroCargas: 0,
    saldoCargado: 0,
    saldoConsumido: 0,
    avgViaje: 0,
    arrServiciosXMes: {},
    arrServiciosXMesOrdenados: {},
    maximoViajes: 0,
    objPrecios: {},
    objTipos: {},
    arrViajesXDia: false,
  });

  const [elementIsVisible, setElementIsVisible] = useState(false);

  useEffect(() => {
    document.title = "Movimientos Sube";
    const countByMonth = () => {
      const data = mainFile.Data.Items;
      const result = {};

            data.forEach((item) => {
        if (
            item.Type !== "Carga virtual" &&
            item.Type !== "Carga Tarjeta Digital"
        ) {
            const date = new Date(item.Date);
            const month = date.getMonth();
            const year = date.getFullYear(); // Obtener el año completo
            const anio = date.getFullYear().toString().slice(-2);
            const balance = Math.abs(
                Number(item.BalanceFormat.slice(2).replace(",", "."))
            );
            // Usar una clave única que combine mes y año
            const key = `${month+1}-${year}`;
            if (result[key]) {
                result[key].cantidad++;
                result[key].saldoConsumido += balance;
            } else {
                const monthWithYear = allMesData.monthNames[month];
                monthWithYear.push(anio);
                result[key] = {
                    key: `${month+1}-${year}`,
                    mes: month + 1,
                    cantidad: 1,
                    nombre: monthWithYear, // Incluir el año
                    saldoConsumido: balance,
                };
            }
        }
    });

      return Object.values(result);
    };
    setInfoTotales(countByMonth());
  }, []);

  function isAlterArray(example) {
    if (Math.random() < 0.5) {
      return example;
    }
    const tasaCambio = Math.random();
    const exampleItemsAlter = example.Data.Items.filter(
      (item) => Math.random() > tasaCambio && item
    );

    return { ...example, Data: { ...example.Data, Items: exampleItemsAlter } };
  }

  const handleChange = (event) => {
    setMes(event.target.value);
    setElementIsVisible(false);
  };

  const handleElIsVisible = () => {
    setElementIsVisible(!elementIsVisible);
  };

  useEffect(() => {
    console.log({infoTotales})
    //aca hay que modificar, mes filtra por mes y no por key
    setMesProvisorioTotales(
      mainFile.Data.Items.filter((item) => {
        const fecha = new Date(item.Date);
        const month = fecha.getMonth();
        const year = fecha.getFullYear(); // Obtener el año completo
        return `${month+1}-${year}` === mes || mes === "all";
      })
    );
  }, [mes]);

  useEffect(() => {
    function saldoSumadora(prev, item) {
      const value = !["Carga virtual", "Carga Tarjeta Digital"].includes(
        item.Type
      )
        ? Math.abs(Number(item.BalanceFormat.slice(2).replace(",", ".")))
        : 0;
      return prev + value;
    }
    function saldoCargadora(prev, item) {
      const value = ["Carga virtual", "Carga Tarjeta Digital"].includes(
        item.Type
      )
        ? Math.abs(Number(item.BalanceFormat.slice(2).replace(",", ".")))
        : 0;
      return prev + value;
    }
    const nroCargas = mesProvisorioTotales.filter((item) =>
      ["Carga virtual", "Carga Tarjeta Digital"].includes(item.Type)
    ).length;
    const nroMovimientos = mesProvisorioTotales.length;
    const nroServicios = nroMovimientos - nroCargas;
    const saldoConsumido = mesProvisorioTotales.reduce(saldoSumadora, 0);
    const avgViaje = saldoConsumido / nroServicios;
    const saldoCargado = mesProvisorioTotales.reduce(saldoCargadora, 0);

    const arrServiciosXMes = mesProvisorioTotales.reduce((acc, item) => {
      if (
        item.Type !== "Carga virtual" &&
        item.Type !== "Carga Tarjeta Digital"
      ) {
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
        if (
          item.Type !== "Carga virtual" &&
          item.Type !== "Carga Tarjeta Digital"
        ) {
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

    const arrServiciosXMesOrdenados = arrServiciosXMes.sort(
      (a, b) => b.value - a.value
    );
    const maximoViajes = arrServiciosXMesOrdenados[0]?.value;

    const tiposArray = [];
    const cantidadTiposArray = [];

    mesProvisorioTotales
      .reduce((acc, item) => {
        const found = acc.find((el) => el.Type === item.Type);
        if (found) {
          found.total++;
        } else {
          acc.push({ Type: item.Type, total: 1 });
        }

        return acc;
      }, [])
      .forEach((item) => {
        tiposArray.push(item.Type);
        cantidadTiposArray.push(item.total);
      });

    const arrViajesXDia = (function () {
      if (mes !== "all") {
        return false;
        const counts = new Array(allMesData.monthNames[mes - 1][2]).fill(0);
        const arrDias = Array.from({ length: counts.length }, (_, i) => i + 1);
        // Contar la cantidad de elementos por día
        mesProvisorioTotales.forEach((item) => {
          if (
            item.Type !== "Carga virtual" &&
            item.Type !== "Carga Tarjeta Digital"
          ) {
            const day = new Date(item.Date).getDate();
            counts[day - 1]++;
          }
        });
        return { arrDias, counts };
      } else {
        return false;
      }
    })();

    setAllMesData({
      monthNames: [
        ["Ene", "Enero", 31],
        ["Feb", "Febrero", 29],
        ["Mar", "Marzo", 31],
        ["Abr", "Abril", 30],
        ["May", "Mayo", 31],
        ["Jun", "Junio", 30],
        ["Jul", "Julio", 31],
        ["Ago", "Agosto", 31],
        ["Set", "Septiembre", 30],
        ["Oct", "Octubre", 31],
        ["Nov", "Noviembre", 30],
        ["Dic", "Diciembre", 31],
      ],
      nroMovimientos,
      nroCargas,
      nroServicios,
      saldoConsumido,
      avgViaje,
      saldoCargado,
      arrServiciosXMes,
      arrServiciosXMesOrdenados,
      maximoViajes,
      objPrecios: { preciosArray, cantidadPreciosArray },
      objTipos: { tiposArray, cantidadTiposArray },
      arrViajesXDia,
    });
  }, [mesProvisorioTotales]);

  const rankingServicios =
    allMesData.arrServiciosXMes.length > 0
      ? allMesData.arrServiciosXMes.map((servicio, index) => {
          const percentaje = (
            (100 * servicio.value) /
            allMesData.nroServicios
          ).toFixed(0);
          const porcentajeRelativo =
            (100 * servicio.value) / allMesData.maximoViajes;
          const percentajeSobreMaximo =
            porcentajeRelativo === 100 ? 97 : porcentajeRelativo;
          const elementStyle =
            index < 5 || (index > 5 && elementIsVisible)
              ? { width: `${percentajeSobreMaximo}%`, overflowX: "visible" }
              : {
                  width: `${percentajeSobreMaximo}%`,
                  overflowX: "visible",
                  display: "none",
                };
          return (
            <li className="li-marker" key={servicio.id} style={elementStyle}>
              <span>{servicio.label}</span> <span>{servicio.value} veces</span>{" "}
              <span> {percentaje}%</span>
            </li>
          );
        })
      : "";

  const inputSelect = (
    <div className="inputSelect">
      <FormControl fullWidth sx={{ minWidth: 200 }}>
        <InputLabel id="demo-simple-select-label">Mes</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={mes}
          label="Mes"
          onChange={handleChange}
        >
          <MenuItem value={"all"}>Todos los datos</MenuItem>
          {infoTotales.map((dataMes) => 
          (
            <MenuItem key={dataMes.key} value={dataMes.key}>
              {dataMes.key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );

  return (
    <>
      <Button
        fullWidth
        variant="outlined"
        sx={{ marginTop: 1 }}
        onClick={() => {
          !file ? setIsValid(false) : setFileContent(false);
        }}
      >
        Volver
      </Button>
      <h2>Servicios x mes</h2>
      <div className="graph">
        <BarChart
          width={500}
          height={300}
          dataset={infoTotales}
          series={[{ dataKey: "cantidad", label: "Cantidad de servicios" }]}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "key",
              //valueFormatter: (item) => `${item[0]} ${item[3]}`,
            },
          ]}
        />
      </div>
      <h2>Saldo total x mes consumido</h2>
      <div className="graph">
        <BarChart
          width={500}
          height={300}
          dataset={infoTotales}
          series={[
            {
              dataKey: "saldoConsumido",
              label: "Saldo consumido",
              valueFormatter: (item) => `$ ${item}`,
            },
          ]}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "key",
              //valueFormatter: (item) => `${item[0]} ${item[3]}`,
            },
          ]}
        />
      </div>
      <h2>Data x mes</h2>
      {inputSelect}

      <ul className="ulInfo">
        <li className="li-datainfo">
          <span>{allMesData["nroMovimientos"]}</span>
          <span>Movimientos totales</span>
        </li>
        <li className="li-datainfo">
          <span>{allMesData["nroServicios"]}</span>
          <span>Servicios totales</span>
        </li>
        <li className="li-datainfo">
          <span>$ {allMesData["saldoConsumido"].toFixed(2)}</span>
          <span>Saldo consumido</span>
        </li>
        <li className="li-datainfo">
          <span>{allMesData["nroCargas"]}</span>
          <span>Número de cargas</span>
        </li>
        <li className="li-datainfo">
          <span>$ {allMesData["saldoCargado"].toFixed(2)}</span>
          <span>Saldo cargado</span>
        </li>
        <li className="li-datainfo">
          <span> $ {allMesData["avgViaje"].toFixed(2)}</span>
          <span>Promedio por viaje</span>
        </li>
      </ul>

      <h2>Servicios</h2>
      {allMesData["arrServiciosXMes"].length && <ul> {rankingServicios} </ul>}
      <div className="icon">
        {rankingServicios.length > 5 && !elementIsVisible ? (
          <AddCircleOutlineRounded
            fontSize="large"
            className="icon"
            onClick={() => handleElIsVisible()}
          />
        ) : (
          <RemoveCircleOutline
            fontSize="large"
            className="icon"
            onClick={() => handleElIsVisible()}
          />
        )}
      </div>
      {allMesData["arrServiciosXMes"].length && (
        <div className="graph">
          <PieChart
            slotProps={{
              legend: {
                /*direction: "row",
                position: { vertical: "bottom", horizontal: "right" },
                padding: 0,*/
                hidden: true,
              },
            }}
            series={[
              {
                data: allMesData["arrServiciosXMes"],
                highlightScope: { faded: "global", highlighted: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                innerRadius: 30,
              },
            ]}
            width={500}
            height={300}
          />
        </div>
      )}

      <h2>Por tipo de servicio</h2>
      {Object.keys(allMesData.objTipos).length !== 0 && (
        <div className="graph">
          <BarChart
            yAxis={[
              { scaleType: "band", data: allMesData.objTipos.tiposArray },
            ]}
            series={[{ data: allMesData.objTipos.cantidadTiposArray }]}
            width={500}
            height={300}
            layout="horizontal"
          />
        </div>
      )}

      <h2>Por precio del pasaje</h2>
      {Object.keys(allMesData.objPrecios).length !== 0 && (
        <div className="graph">
          <BarChart
            yAxis={[
              { scaleType: "band", data: allMesData.objPrecios.preciosArray },
            ]}
            series={[{ data: allMesData.objPrecios.cantidadPreciosArray }]}
            width={500}
            height={300}
            layout="horizontal"
          />
        </div>
      )}

      {allMesData.arrViajesXDia && (
        <>
          <h2>Viajes x día</h2>
          <LineChart
            xAxis={[{ data: allMesData.arrViajesXDia.arrDias }]}
            series={[
              {
                data: allMesData.arrViajesXDia.counts,
              },
            ]}
            width={500}
            height={300}
          />
        </>
      )}
    </>
  );
}
