import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "motion/react";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Calendar,
  Sparkles,
  Download,
  Award,
  BarChart2,
  PieChart,
  ArrowUpRight
} from "lucide-react";

interface MonthlyData {
  month: string;
  sales: number; // in FCFA
  orders: number; // order count
  forecast?: boolean;
}

interface CategoryData {
  category: string;
  share: number; // percentage
  sales: number; // in FCFA
}

const monthlyData2025: MonthlyData[] = [
  { month: "Janvier", sales: 1120000, orders: 110 },
  { month: "Février", sales: 980000, orders: 95 },
  { month: "Mars", sales: 1340000, orders: 130 },
  { month: "Avril", sales: 1220000, orders: 115 },
  { month: "Mai", sales: 1560000, orders: 160 },
  { month: "Juin", sales: 1890000, orders: 185 },
  { month: "Juillet", sales: 1450000, orders: 140 },
  { month: "Août", sales: 1320000, orders: 125 },
  { month: "Septembre", sales: 1780000, orders: 175 },
  { month: "Octobre", sales: 1920000, orders: 190 },
  { month: "Novembre", sales: 2450000, orders: 240 },
  { month: "Décembre", sales: 3850000, orders: 390 }
];

const monthlyData2026: MonthlyData[] = [
  { month: "Janvier", sales: 1450000, orders: 135 },
  { month: "Février", sales: 1650000, orders: 155 },
  { month: "Mars", sales: 2100000, orders: 200 },
  { month: "Avril", sales: 1980000, orders: 180 },
  { month: "Mai", sales: 2450000, orders: 225 },
  { month: "Juin", sales: 2890000, orders: 270 },
  { month: "Juillet", sales: 2750000, orders: 255, forecast: true },
  { month: "Août", sales: 2500000, orders: 230, forecast: true },
  { month: "Septembre", sales: 2900000, orders: 260, forecast: true },
  { month: "Octobre", sales: 3250000, orders: 300, forecast: true },
  { month: "Novembre", sales: 3700000, orders: 340, forecast: true },
  { month: "Décembre", sales: 4950000, orders: 470, forecast: true }
];

const categories2026: CategoryData[] = [
  { category: "Vêtements & Mode", share: 32, sales: 11072000 },
  { category: "Made in Togo Premium", share: 20, sales: 6920000 },
  { category: "Chaussures Premium", share: 15, sales: 5190000 },
  { category: "Montres & Accessoires", share: 12, sales: 4152000 },
  { category: "Plats & Gastronomie", share: 10, sales: 3460000 },
  { category: "Paniers Frais & Épicerie", share: 6, sales: 2076000 },
  { category: "Importations Trends", share: 5, sales: 1730000 }
];

const categories2025: CategoryData[] = [
  { category: "Vêtements & Mode", share: 30, sales: 6588000 },
  { category: "Made in Togo Premium", share: 18, sales: 3952800 },
  { category: "Chaussures Premium", share: 16, sales: 3513600 },
  { category: "Montres & Accessoires", share: 13, sales: 2854800 },
  { category: "Plats & Gastronomie", share: 11, sales: 2415600 },
  { category: "Paniers Frais & Épicerie", share: 7, sales: 1537200 },
  { category: "Importations Trends", share: 5, sales: 1098000 }
];

interface AdminStatsProps {
  compact?: boolean;
}

export default function AdminStats({ compact = false }: AdminStatsProps) {
  const [selectedYear, setSelectedYear] = useState<"2025" | "2026">("2026");
  const [selectedMetric, setSelectedMetric] = useState<"sales" | "orders">("sales");
  const [hoveredBar, setHoveredBar] = useState<MonthlyData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 340 });

  const data = selectedYear === "2025" ? monthlyData2025 : monthlyData2026;
  const categories = selectedYear === "2025" ? categories2025 : categories2026;

  // Track size for responsive resizing
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      const targetWidth = Math.max(width, 300);
      setDimensions({
        width: targetWidth,
        height: compact ? 320 : 360
      });
    });

    resizeObserver.observe(chartContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [compact]);

  // Main D3 Drawing & Animations
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 28, right: 16, bottom: 38, left: 58 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const defs = svg.append("defs");
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "gold-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    linearGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#e5c158");

    linearGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#b8901c");

    const forecastGradient = defs
      .append("linearGradient")
      .attr("id", "forecast-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    forecastGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#d6d3d1");

    forecastGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#a8a29e");

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.38);

    const maxY = d3.max(data, (d) => d[selectedMetric]) || 100;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxY * 1.12])
      .range([innerHeight, 0]);

    // Horizontal grid lines
    const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => "");
    g.append("g")
      .attr("class", "grid")
      .call(yGrid)
      .call((gGroup) => gGroup.select(".domain").remove())
      .selectAll(".tick line")
      .attr("stroke", "#f1f5f9")
      .attr("stroke-dasharray", "4,4");

    // X Axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((gGroup) => gGroup.select(".domain").attr("stroke", "#e5e7eb"))
      .selectAll("text")
      .attr("class", "text-[11px] font-sans font-medium text-neutral-500")
      .text((d: any) => (dimensions.width < 640 ? String(d).slice(0, 3) : String(d)))
      .attr("dy", "14px");

    // Y Axis
    g.append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(0)
          .tickFormat((d) => {
            const num = +d;
            if (selectedMetric === "sales") {
              if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
              if (num >= 1000) return (num / 1000).toFixed(0) + "k";
            }
            return num.toString();
          })
      )
      .call((gGroup) => gGroup.select(".domain").remove())
      .selectAll("text")
      .attr("class", "text-[11px] font-mono tabular-nums font-medium text-neutral-400")
      .attr("dx", "-6px");

    // Bars
    const barGroups = g
      .selectAll(".bar-group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar-group");

    barGroups
      .append("rect")
      .attr("class", "cursor-pointer transition-opacity duration-150")
      .attr("x", (d) => xScale(d.month) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", (d) => (d.forecast ? "url(#forecast-gradient)" : "url(#gold-gradient)"))
      .attr("rx", 6)
      .attr("ry", 6)
      .on("mouseenter", function (event, d) {
        setHoveredBar(d);
        d3.select(this).attr("opacity", 0.85).attr("stroke", "#0f5132").attr("stroke-width", 1.5);
      })
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event, chartContainerRef.current);
        setTooltipPos({ x: mx, y: Math.max(10, my - 76) });
      })
      .on("mouseleave", function () {
        setHoveredBar(null);
        d3.select(this).attr("opacity", 1).attr("stroke", "none");
      })
      .transition()
      .duration(650)
      .delay((d, i) => i * 30)
      .attr("y", (d) => yScale(d[selectedMetric]))
      .attr("height", (d) => innerHeight - yScale(d[selectedMetric]));

    // Smooth trend line overlay in deep emerald (#0f5132)
    const lineGenerator = d3
      .line<MonthlyData>()
      .x((d) => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d[selectedMetric]))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#0f5132")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.65)
      .attr("d", lineGenerator);

    // Value labels above bars on wide screens
    barGroups
      .append("text")
      .attr("x", (d) => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d[selectedMetric]) - 8)
      .attr("text-anchor", "middle")
      .attr("class", "text-[9.5px] font-mono tabular-nums font-semibold fill-neutral-600 pointer-events-none opacity-0")
      .text((d) => {
        const val = d[selectedMetric];
        if (selectedMetric === "sales") {
          return (val / 1000000).toFixed(1) + "M";
        }
        return val;
      })
      .transition()
      .duration(700)
      .delay(500)
      .attr(
        "class",
        `text-[9.5px] font-mono tabular-nums font-semibold fill-neutral-600 pointer-events-none transition-opacity duration-200 ${
          dimensions.width > 580 ? "opacity-100" : "opacity-0"
        }`
      );
  }, [data, selectedMetric, dimensions]);

  const activeTotalSales = data.reduce((acc, curr) => acc + curr.sales, 0);
  const activeTotalOrders = data.reduce((acc, curr) => acc + curr.orders, 0);
  const activeAverageBasket = Math.round(activeTotalSales / activeTotalOrders);
  const bestMonthObj = [...data].sort((a, b) => b[selectedMetric] - a[selectedMetric])[0];

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Mois,Chiffre d'Affaires (FCFA),Nombre de Commandes,Type\n";

    data.forEach((row) => {
      csvContent += `"${row.month}",${row.sales},${row.orders},"${row.forecast ? "Prévision" : "Historique"}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `miabeasi_stats_ventes_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="sales-dashboard-section" className="space-y-6 animate-fade-in text-neutral-900">
      {/* Metrics & Year Selectors Header Bar */}
      {!compact && (
        <div className="bg-white p-6 border border-neutral-200/90 rounded-2xl shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-display font-bold text-base tracking-tight text-neutral-950 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#b8901c] flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4" />
              </span>
              <span>Analyse Financière &amp; Performances Annuelles</span>
            </h3>
            <p className="text-neutral-500 text-xs mt-1">
              Suivi consolidé du chiffre d&apos;affaires, du volume de commandes et de la répartition par catégorie.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Year selector toggle */}
            <div className="bg-neutral-100 p-1 rounded-xl flex items-center border border-neutral-200/80 text-xs font-medium shrink-0">
              <button
                type="button"
                onClick={() => setSelectedYear("2026")}
                className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  selectedYear === "2026"
                    ? "bg-neutral-950 text-white shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Exercice 2026
              </button>
              <button
                type="button"
                onClick={() => setSelectedYear("2025")}
                className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  selectedYear === "2025"
                    ? "bg-neutral-950 text-white shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Exercice 2025
              </button>
            </div>

            {/* Metric Selector Toggle */}
            <div className="bg-neutral-100 p-1 rounded-xl flex items-center border border-neutral-200/80 text-xs font-medium shrink-0">
              <button
                type="button"
                onClick={() => setSelectedMetric("sales")}
                className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  selectedMetric === "sales"
                    ? "bg-[#d4af37] text-neutral-950 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Chiffre d&apos;affaires
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric("orders")}
                className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  selectedMetric === "orders"
                    ? "bg-[#d4af37] text-neutral-950 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Commandes
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 px-4 py-2 rounded-xl font-semibold text-xs transition-colors shadow-2xs ml-auto md:ml-0 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI highlight cards (shown in full stats view) */}
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1 */}
          <div id="kpi-sales" className="bg-white border border-neutral-200/90 p-6 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Chiffre d&apos;Affaires Annuel</span>
              <span className="w-9 h-9 rounded-xl bg-[#d4af37]/15 text-[#b8901c] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="font-mono tabular-nums text-2xl font-bold text-neutral-950">
                {formatFCFA(activeTotalSales)}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-emerald-700 font-mono tabular-nums font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {selectedYear === "2026" ? "+45.2%" : "+18.4%"}
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-500">Cumulé sur {selectedYear}</span>
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div id="kpi-orders" className="bg-white border border-neutral-200/90 p-6 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Volume de Commandes</span>
              <span className="w-9 h-9 rounded-xl bg-[#0f5132]/10 text-[#0f5132] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="font-mono tabular-nums text-2xl font-bold text-neutral-950">
                {activeTotalOrders} commandes
              </h4>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-emerald-700 font-mono tabular-nums font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {selectedYear === "2026" ? "+36.1%" : "+12.7%"}
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-500">Colis traités</span>
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div id="kpi-basket" className="bg-white border border-neutral-200/90 p-6 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Panier Moyen</span>
              <span className="w-9 h-9 rounded-xl bg-[#d4af37]/15 text-[#b8901c] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="font-mono tabular-nums text-2xl font-bold text-neutral-950">
                {formatFCFA(activeAverageBasket)}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-emerald-700 font-mono tabular-nums font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +5.8%
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-500">Valeur moyenne par panier</span>
              </div>
            </div>
          </div>

          {/* KPI 4 */}
          <div id="kpi-best-month" className="bg-white border border-neutral-200/90 p-6 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Pic d&apos;Activité Mensuel</span>
              <span className="w-9 h-9 rounded-xl bg-neutral-950 text-[#d4af37] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <h4 className="font-display font-bold text-2xl text-neutral-950">
                {bestMonthObj?.month}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="font-mono tabular-nums font-semibold text-[#b8901c] flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {selectedMetric === "sales" ? formatFCFA(bestMonthObj?.sales) : `${bestMonthObj?.orders} commandes`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHART & CATEGORIES DUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main D3 Chart Panel */}
        <div className="lg:col-span-8 bg-white p-6 border border-neutral-200/90 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 mb-5 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#d4af37] rounded-full"></span>
                <h3 className="font-display font-bold text-base text-neutral-950">
                  Évolution Mensuelle des Performances ({selectedYear})
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {selectedMetric === "sales" ? "Revenus mensuels en FCFA" : "Volume mensuel de commandes"} · Projections S2 incluses
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-neutral-100 p-1 rounded-xl flex items-center border border-neutral-200/70">
                <button
                  type="button"
                  onClick={() => setSelectedYear("2026")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedYear === "2026" ? "bg-white text-neutral-950 shadow-2xs" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  2026
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedYear("2025")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedYear === "2025" ? "bg-white text-neutral-950 shadow-2xs" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  2025
                </button>
              </div>

              <div className="bg-neutral-100 p-1 rounded-xl flex items-center border border-neutral-200/70">
                <button
                  type="button"
                  onClick={() => setSelectedMetric("sales")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedMetric === "sales" ? "bg-[#d4af37] text-neutral-950 shadow-2xs" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Revenus
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMetric("orders")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedMetric === "orders" ? "bg-[#d4af37] text-neutral-950 shadow-2xs" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Commandes
                </button>
              </div>

              {compact && (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  title="Exporter en CSV"
                  className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div ref={chartContainerRef} className="relative w-full overflow-hidden">
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="mx-auto"
            />

            {/* Micro-interactive Tooltip */}
            {hoveredBar && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: "absolute",
                  left: Math.min(tooltipPos.x + 12, dimensions.width - 190),
                  top: tooltipPos.y,
                  pointerEvents: "none"
                }}
                className="bg-neutral-950 text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs space-y-1.5 border border-[#d4af37]/30 z-20 min-w-44"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-1 font-semibold text-white">
                  <span>{hoveredBar.month} {selectedYear}</span>
                  {hoveredBar.forecast && (
                    <span className="text-[10px] text-[#d4af37]">Prévision</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-400">Revenus :</span>
                  <span className="font-mono tabular-nums font-bold text-[#e5c158]">{formatFCFA(hoveredBar.sales)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-400">Commandes :</span>
                  <span className="font-mono tabular-nums font-bold text-white">{hoveredBar.orders}</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-2 text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#d4af37]"></span>
                <span>Réalisé</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-stone-300"></span>
                <span>Projection S2</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#0f5132]"></span>
                <span>Tendance</span>
              </span>
            </div>
            <span className="font-mono tabular-nums font-semibold text-neutral-700">
              Total {selectedYear} : {formatFCFA(activeTotalSales)}
            </span>
          </div>
        </div>

        {/* Categories Breakdown Panel */}
        <div className="lg:col-span-4 bg-white p-6 border border-neutral-200/90 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div>
                <h3 className="font-display font-bold text-base text-neutral-950 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#d4af37]" />
                  <span>Répartition par Catégorie</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Parts des ventes sur l&apos;exercice {selectedYear}</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800 truncate pr-2">{cat.category}</span>
                    <span className="font-mono tabular-nums font-semibold text-neutral-900">{cat.share}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.share}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${idx === 0 ? "bg-[#0f5132]" : "bg-[#d4af37]"}`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Volume généré</span>
                    <span className="font-mono tabular-nums text-neutral-600">{formatFCFA(cat.sales)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-5 flex items-center justify-between text-xs">
            <span className="text-neutral-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Segment leader : <strong className="text-neutral-900">Mode &amp; Terroir</strong></span>
            </span>
            <span className="font-mono tabular-nums font-semibold text-[#0f5132]">52% cumulé</span>
          </div>
        </div>
      </div>

      {/* TABLE DES DONNÉES MENSUELLES COMPLÈTE */}
      {!compact && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-base text-neutral-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d4af37]" />
                <span>Tableau de Synthèse Mensuelle ({selectedYear})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Détail comptable mois par mois avec panier moyen et cycle trimestriel.</p>
            </div>
            <span className="text-xs text-neutral-500 font-mono tabular-nums">
              12 périodes · Consolidé {selectedYear}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px]">
                  <th className="py-3.5 px-6">Période Mensuelle</th>
                  <th className="py-3.5 px-6 text-right">Chiffre d&apos;Affaires</th>
                  <th className="py-3.5 px-6 text-right">Volume Commandes</th>
                  <th className="py-3.5 px-6 text-right">Panier Moyen</th>
                  <th className="py-3.5 px-6 text-right">Cycle Trimestriel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.map((row, idx) => {
                  const isQ4 = idx >= 9;
                  const isQ3 = idx >= 6 && idx < 9;
                  const isQ2 = idx >= 3 && idx < 6;
                  let qLabel = "T1 · Lancement";
                  if (isQ2) qLabel = "T2 · Croissance";
                  if (isQ3) qLabel = "T3 · Consolidation";
                  if (isQ4) qLabel = "T4 · Pic Fin d'Année";

                  return (
                    <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-neutral-900">
                        <div className="flex items-center gap-2">
                          <span>{row.month}</span>
                          {row.forecast && (
                            <span className="text-[11px] font-normal text-amber-700">
                              · Prévision
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums font-semibold text-[#b8901c]">
                        {formatFCFA(row.sales)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums font-medium text-neutral-900">
                        {row.orders} colis
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums text-neutral-600">
                        {formatFCFA(Math.round(row.sales / row.orders))}
                      </td>
                      <td className="py-3.5 px-6 text-right text-neutral-500">
                        <span className={isQ4 ? "text-[#0f5132] font-semibold" : "text-neutral-500"}>
                          {qLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
