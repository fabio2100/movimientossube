import {
  BarChart,
  LineChart,
  PieChart,
} from "@mui/x-charts";
import example from "../movimientos/total082024.json";
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
    objTiposProcesados: {},
    arrViajesXDia: false,
    porDiaDeSemana: [
      { day: "Lunes", count: 0 },
      { day: "Martes", count: 0 },
      { day: "Miércoles", count: 0 },
      { day: "Jueves", count: 0 },
      { day: "Viernes", count: 0 },
      { day: "Sábado", count: 0 },
      { day: "Domingo", count: 0 },
    ],
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
          const key = `${month + 1}-${year}`;
          if (result[key]) {
            result[key].cantidad++;
            result[key].saldoConsumido += balance;
          } else {
            const monthWithYear = allMesData.monthNames[month];
            const displayName = `${monthWithYear[0]} ${anio}`;
            result[key] = {
              key: `${month + 1}-${year}`,
              mes: month + 1,
              cantidad: 1,
              nombre: displayName, // Formato: "Jun 25"
              saldoConsumido: balance,
            };
          }
        }
      });

      // Ordenar por año y mes de más antiguo a más reciente
      return Object.values(result).sort((a, b) => {
        const [mesA, yearA] = a.key.split('-').map(Number);
        const [mesB, yearB] = b.key.split('-').map(Number);
        
        if (yearA !== yearB) {
          return yearA - yearB;
        }
        return mesA - mesB;
      });
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
    setMesProvisorioTotales(
      mainFile.Data.Items.filter((item) => {
        const fecha = new Date(item.Date);
        const month = fecha.getMonth();
        const year = fecha.getFullYear(); // Obtener el año completo
        return `${month + 1}-${year}` === mes || mes === "all";
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

    const preciosData = mesProvisorioTotales
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
      .map((item) => {
        // Convertir el precio a valor absoluto para ordenar
        const precioNumerico = Math.abs(Number(item.precio.slice(2).replace(",", ".")));
        // Formatear como precio positivo
        const precioFormateado = `$${precioNumerico.toFixed(2).replace(".", ",")}`;
        return {
          ...item,
          precio: precioFormateado,
          valorNumerico: precioNumerico
        };
      })
      .sort((a, b) => a.valorNumerico - b.valorNumerico); // Ordenar de menor a mayor

    preciosData.forEach((item) => {
      preciosArray.push(item.precio);
      cantidadPreciosArray.push(item.total);
    });

    const arrServiciosXMesOrdenados = arrServiciosXMes.sort(
      (a, b) => b.value - a.value
    );
    const maximoViajes = arrServiciosXMesOrdenados[0]?.value;

    const tiposArray = [];
    const cantidadTiposArray = [];

    const tiposDataOriginal = mesProvisorioTotales.reduce((acc, item) => {
      const found = acc.find((el) => el.Type === item.Type);
      if (found) {
        found.total++;
      } else {
        acc.push({ Type: item.Type, total: 1 });
      }
      return acc;
    }, []);

    // Ordenar según el orden solicitado: Uso, Uso con RED SUBE 1, Uso con RED SUBE 2, después todo lo demás
    const ordenPrioridad = ["Uso", "Uso con RED SUBE 1", "Uso con RED SUBE 2"];
    const tiposOrdenados = [];

    // Agregar primero los tipos prioritarios en orden
    ordenPrioridad.forEach(tipo => {
      const tipoEncontrado = tiposDataOriginal.find(item => item.Type === tipo);
      if (tipoEncontrado) {
        tiposOrdenados.push(tipoEncontrado);
      }
    });

    // Agregar el resto de tipos
    tiposDataOriginal.forEach(item => {
      if (!ordenPrioridad.includes(item.Type)) {
        tiposOrdenados.push(item);
      }
    });

    tiposOrdenados.forEach((item) => {
      tiposArray.push(item.Type);
      cantidadTiposArray.push(item.total);
    });

    // Procesamiento de tipos con lógica de resta
    const tiposData = mesProvisorioTotales.reduce((acc, item) => {
      const found = acc.find((el) => el.Type === item.Type);
      if (found) {
        found.total++;
      } else {
        acc.push({ Type: item.Type, total: 1 });
      }
      return acc;
    }, []);

    // Crear una copia para poder modificar los valores
    const tiposDataProcesado = tiposData.map(item => ({ ...item }));

    // Obtener los valores originales
    const usoRedSube2Item = tiposDataProcesado.find(el => el.Type === "Uso con RED SUBE 2");
    const usoRedSube1Item = tiposDataProcesado.find(el => el.Type === "Uso con RED SUBE 1");
    const usoItem = tiposDataProcesado.find(el => el.Type === "Uso");

    const usoRedSube2Count = usoRedSube2Item ? usoRedSube2Item.total : 0;

    // Aplicar la lógica de resta
    if (usoRedSube1Item && usoRedSube2Count > 0) {
      // "Uso con RED SUBE 1" = "Uso con RED SUBE 1" - "Uso con RED SUBE 2"
      usoRedSube1Item.total = Math.max(0, usoRedSube1Item.total - usoRedSube2Count);
    }

    if (usoItem) {
      // "Uso" = "Uso" - "Uso con RED SUBE 2" - "Uso con RED SUBE 1(valor nuevo)"
      const nuevoUsoRedSube1Count = usoRedSube1Item ? usoRedSube1Item.total : 0;
      usoItem.total = Math.max(0, usoItem.total - usoRedSube2Count - nuevoUsoRedSube1Count);
    }

    // Crear arrays finales con orden y leyendas personalizadas para el gráfico procesado
    const tiposArrayProcesado = [];
    const cantidadTiposArrayProcesado = [];

    // Separar los tipos de "Uso" de los demás tipos
    const tiposUso = [];
    const otrosTipos = [];

    // Ordenar los tipos procesados según el mismo orden y aplicar leyendas personalizadas
    const tiposProcesadosOrdenados = [];

    // Agregar primero los tipos prioritarios en orden con leyendas personalizadas
    ordenPrioridad.forEach(tipo => {
      const tipoEncontrado = tiposDataProcesado.find(item => item.Type === tipo && item.total > 0);
      if (tipoEncontrado) {
        const tipoConLeyenda = { ...tipoEncontrado };
        // Cambiar las leyendas según lo solicitado
        if (tipoEncontrado.Type === "Uso") {
          tipoConLeyenda.Type = "Viaje normal";
        } else if (tipoEncontrado.Type === "Uso con RED SUBE 1") {
          tipoConLeyenda.Type = "Viajes con trasbordo";
        } else if (tipoEncontrado.Type === "Uso con RED SUBE 2") {
          tipoConLeyenda.Type = "Viajes con 2 trasbordos";
        }
        tiposUso.push(tipoConLeyenda);
      }
    });

    // Agregar el resto de tipos que tengan total > 0
    tiposDataProcesado.forEach(item => {
      if (!ordenPrioridad.includes(item.Type) && item.total > 0) {
        otrosTipos.push(item);
      }
    });

    // Preparar datos para gráfico de barras apiladas
    const datosParaGrafico = [];
    
    // Agregar solo la barra combinada de "Uso" si hay datos
    if (tiposUso.length > 0) {
      const barraUso = { categoria: "Tipos de Uso" };
      tiposUso.forEach(tipo => {
        barraUso[tipo.Type] = tipo.total;
      });
      datosParaGrafico.push(barraUso);
    }

    // Crear series para el gráfico apilado
    const seriesGraficoProcesado = [];
    
    // Calcular el total de tipos de uso para porcentajes
    const totalTiposUso = tiposUso.reduce((sum, tipo) => sum + tipo.total, 0);
    
    // Series solo para los tipos de uso con tooltip personalizado
    tiposUso.forEach(tipo => {
      const porcentaje = totalTiposUso > 0 ? ((tipo.total / totalTiposUso) * 100).toFixed(1) : 0;
      seriesGraficoProcesado.push({
        dataKey: tipo.Type,
        label: tipo.Type,
        stack: "uso",
        valueFormatter: (value) => `${value} (${Math.round(porcentaje)}%)`
      });
    });

    const arrViajesXDia = (function () {
      if (mes !== "all") {
        // Extraer el mes del formato "mes-año"
        const mesNumero = parseInt(mes.split('-')[0]);
        const yearNumero = parseInt(mes.split('-')[1]);
        
        // Determinar los días del mes considerando años bisiestos
        let diasEnMes;
        if (mesNumero === 2 && ((yearNumero % 4 === 0 && yearNumero % 100 !== 0) || (yearNumero % 400 === 0))) {
          diasEnMes = 29; // Febrero bisiesto
        } else {
          diasEnMes = allMesData.monthNames[mesNumero - 1][2];
        }
        
        const counts = new Array(diasEnMes).fill(0);
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

    //Viajes x día de semana
    // Función para obtener el nombre del día en español
    const getDayNameInSpanish = (dateString) => {
      const days = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      const date = new Date(dateString);
      return days[date.getDay()];
    };

    // Todos los días de la semana en español
    const allDays = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];

    // Transformación de datos: agrupar por día de la semana
    const groupedData = mesProvisorioTotales.reduce((acc, transaction) => {
      if (
        transaction.Type !== "Carga virtual" &&
        transaction.Type !== "Carga Tarjeta Digital"
      ) {
        const dayName = getDayNameInSpanish(transaction.Date);
        acc[dayName] = (acc[dayName] || 0) + 1;
      }
      return acc;
    }, {});

    // Completar los días faltantes con valor 0
    const porDiaDeSemana = allDays.map((day) => ({
      day,
      count: groupedData[day] || 0,
    }));

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
      objTiposProcesados: { datosParaGrafico, seriesGraficoProcesado },
      arrViajesXDia,
      porDiaDeSemana,
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
          {infoTotales.map((dataMes) => (
            <MenuItem key={dataMes.key} value={dataMes.key}>
              {dataMes.nombre}
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
              dataKey: "nombre",
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
              dataKey: "nombre",
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

      <h2>Por día de semana</h2>
      <div className="graph">
        <BarChart
          width={500}
          height={300}
          dataset={allMesData.porDiaDeSemana}
          series={[{ dataKey: "count"}]}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "day",
            },
          ]}
        />
      </div>

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

      <h2>Por tipo de servicio (procesado)</h2>
      {Object.keys(allMesData.objTiposProcesados).length !== 0 && (
        <div className="graph">
          <BarChart
            dataset={allMesData.objTiposProcesados.datosParaGrafico}
            series={allMesData.objTiposProcesados.seriesGraficoProcesado}
            yAxis={[
              {
                scaleType: "band",
                dataKey: "categoria",
              },
            ]}
            width={700}
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
                
