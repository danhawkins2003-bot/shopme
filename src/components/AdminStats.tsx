import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  CreditCard,
  Calendar,
  Sparkles,
  Download,
  Award,
  BarChart2,
  PieChart
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

export default function AdminStats() {
  const [selectedYear, setSelectedYear] = useState<"2025" | "2026">("2026");
  const [selectedMetric, setSelectedMetric] = useState<"sales" | "orders">("sales");
  const [hoveredBar, setHoveredBar] = useState<MonthlyData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  const data = selectedYear === "2025" ? monthlyData2025 : monthlyData2026;
  const categories = selectedYear === "2025" ? categories2025 : categories2026;

  // Track size for responsive resizing
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Subtract basic margins and apply constraints
      const targetWidth = Math.max(width, 320);
      setDimensions({
        width: targetWidth,
        height: 380
      });
    });

    resizeObserver.observe(chartContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Main D3 Drawing & Animations
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous layouts entirely

    const margin = { top: 30, right: 20, bottom: 40, left: 65 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    // Create Main Chart canvas
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define beautiful gold-bronze gradient
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
      .attr("stop-color", "#e1be52"); // Bright golden-sand

    linearGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#b38a19"); // Deeper gold

    // Define dashed forecaster design gradient for projections
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
      .attr("stop-color", "#e5e7eb");

    forecastGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#9ca3af");

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.35);

    const maxY = d3.max(data, (d) => d[selectedMetric]) || 100;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxY * 1.1]) // Add 10% headroom
      .range([innerHeight, 0]);

    // Format utility
    const formatValue = (val: number) => {
      if (selectedMetric === "sales") {
        return new Intl.NumberFormat("fr-FR").format(val) + " F";
      }
      return new Intl.NumberFormat("fr-FR").format(val);
    };

    // Horizontal grid lines
    const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => "");
    g.append("g")
      .attr("class", "grid")
      .call(yGrid)
      .call((gGroup) => gGroup.select(".domain").remove())
      .selectAll(".tick line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "3,3");

    // Render original X Axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .call((gGroup) => gGroup.select(".domain").attr("stroke", "#d1d5db"))
      .selectAll("text")
      .attr("class", "text-[10px] font-sans font-medium text-neutral-600")
      // Rotate x-axis labels on small mobile screens
      .attr("transform", dimensions.width < 500 ? "rotate(-30)" : "rotate(0)")
      .style("text-anchor", dimensions.width < 500 ? "end" : "middle")
      .attr("dy", dimensions.width < 500 ? "1px" : "10px");

    // Render original Y Axis with friendly abbreviated marks
    g.append("g")
      .call(
        d3.axisLeft(yScale).ticks(6).tickFormat((d) => {
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
      .attr("class", "text-[10px] font-mono font-medium text-neutral-500");

    // Drawing Bars with transitions
    const barGroups = g
      .selectAll(".bar-group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar-group");

    barGroups
      .append("rect")
      .attr("class", "cursor-pointer transition-all duration-150 rounded-sm")
      .attr("x", (d) => xScale(d.month) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", innerHeight) // start animation from bottom
      .attr("height", 0)
      .attr("fill", (d) => (d.forecast ? "url(#forecast-gradient)" : "url(#gold-gradient)"))
      .attr("rx", 3) // rounded corner radius
      .attr("ry", 3)
      .on("mouseenter", function (event, d) {
        setHoveredBar(d);
        d3.select(this).attr("opacity", 0.85).attr("stroke", "#b38a19").attr("stroke-width", 1.5);
      })
      .on("mousemove", function (event) {
        // Calculate coordinate location relative to container element
        const [mx, my] = d3.pointer(event, chartContainerRef.current);
        setTooltipPos({ x: mx, y: my - 70 });
      })
      .on("mouseleave", function () {
        setHoveredBar(null);
        d3.select(this).attr("opacity", 1).attr("stroke", "none");
      })
      // Transition animation
      .transition()
      .duration(850)
      .delay((d, i) => i * 40)
      .attr("y", (d) => yScale(d[selectedMetric]))
      .attr("height", (d) => innerHeight - yScale(d[selectedMetric]));

    // Add value badges on top of bars
    barGroups
      .append("text")
      .attr("x", (d) => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d[selectedMetric]) - 6)
      .attr("text-anchor", "middle")
      .attr("class", "text-[9px] font-mono font-bold text-neutral-700 pointer-events-none opacity-0")
      // Only show top value labels if dimensions are sufficiently wide
      .text((d) => {
        const val = d[selectedMetric];
        if (selectedMetric === "sales") {
          return (val / 1000000).toFixed(1) + "M";
        }
        return val;
      })
      .transition()
      .duration(1000)
      .delay(900)
      .attr("class", `text-[9px] font-mono font-bold text-neutral-700 pointer-events-none transition-opacity duration-300 ${dimensions.width > 550 ? "opacity-100" : "opacity-0"}`);

  }, [data, selectedMetric, dimensions]);

  // Calculations for KPIs
  const totalSales2026 = monthlyData2026.reduce((acc, curr) => acc + curr.sales, 0);
  const totalOrders2026 = monthlyData2026.reduce((acc, curr) => acc + curr.orders, 0);
  const totalSales2025 = monthlyData2025.reduce((acc, curr) => acc + curr.sales, 0);
  const totalOrders2025 = monthlyData2025.reduce((acc, curr) => acc + curr.orders, 0);

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
    <div id="sales-dashboard-section" className="space-y-8 animate-fade-in text-neutral-900">
      
      {/* Metrics & Year Selectors */}
      <div className="bg-white p-5 border border-neutral-200 rounded-sm shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-neutral-950 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#d4af37]" />
            <span>Filtres analytiques de l'entreprise</span>
          </h3>
          <p className="text-neutral-500 text-xs mt-0.5">Explorez les performances commerciales nationales de Miabé Asi.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Year selector toggle */}
          <div className="bg-neutral-100 p-0.5 rounded-sm flex items-center border border-neutral-200 text-xs font-semibold shrink-0">
            <button
              onClick={() => setSelectedYear("2026")}
              className={`px-3 py-1.5 rounded-sm transition-all duration-200 uppercase tracking-wider text-[11px] cursor-pointer ${
                selectedYear === "2026"
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Année 2026
            </button>
            <button
              onClick={() => setSelectedYear("2025")}
              className={`px-3 py-1.5 rounded-sm transition-all duration-200 uppercase tracking-wider text-[11px] cursor-pointer ${
                selectedYear === "2025"
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Année 2025 (Phys)
            </button>
          </div>

          {/* Metric Selector Toggle */}
          <div className="bg-neutral-100 p-0.5 rounded-sm flex items-center border border-neutral-200 text-xs font-semibold shrink-0">
            <button
              onClick={() => setSelectedMetric("sales")}
              className={`px-3 py-1.5 rounded-sm transition-all duration-200 uppercase tracking-wider text-[11px] cursor-pointer ${
                selectedMetric === "sales"
                  ? "bg-[#d4af37] text-neutral-950 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Chiffre d'affaires
            </button>
            <button
              onClick={() => setSelectedMetric("orders")}
              className={`px-3 py-1.5 rounded-sm transition-all duration-200 uppercase tracking-wider text-[11px] cursor-pointer ${
                selectedMetric === "orders"
                  ? "bg-[#d4af37] text-neutral-950 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Commandes
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-850 hover:bg-[#d4af37] text-white hover:text-neutral-950 px-3.5 py-1.5 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-colors shadow-xs ml-auto md:ml-0 cursor-pointer text-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI highlight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div id="kpi-sales" className="bg-white border border-neutral-200 p-5 rounded-sm shadow-xs relative overflow-hidden group">
          <div className="absolute right-4 top-4 opacity-15 text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
            <CreditCard className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Chiffre d'Affaires</span>
          <h4 className="font-mono text-xl sm:text-2xl font-black text-neutral-950 mt-1">
            {formatFCFA(activeTotalSales)}
          </h4>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {selectedYear === "2026" ? "+45.2%" : "+18.4%"}
            </span>
            <span className="text-[10px] text-neutral-500 uppercase">Cumulé sur l'année</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div id="kpi-orders" className="bg-white border border-neutral-200 p-5 rounded-sm shadow-xs relative overflow-hidden group">
          <div className="absolute right-4 top-4 opacity-15 text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Volume de Ventes</span>
          <h4 className="font-mono text-xl sm:text-2xl font-black text-neutral-950 mt-1">
            {activeTotalOrders} Commandes
          </h4>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {selectedYear === "2026" ? "+36.1%" : "+12.7%"}
            </span>
            <span className="text-[10px] text-neutral-500 uppercase">Colis expédiés</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div id="kpi-basket" className="bg-white border border-neutral-200 p-5 rounded-sm shadow-xs relative overflow-hidden group">
          <div className="absolute right-4 top-4 opacity-15 text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Panier Moyen</span>
          <h4 className="font-mono text-xl sm:text-2xl font-black text-neutral-950 mt-1">
            {formatFCFA(activeAverageBasket)}
          </h4>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +5.8%
            </span>
            <span className="text-[10px] text-neutral-500 uppercase">Par client par achat</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div id="kpi-best-month" className="bg-white border border-neutral-200 p-5 rounded-sm shadow-xs relative overflow-hidden group">
          <div className="absolute right-4 top-4 opacity-15 text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
            <Award className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Meilleur Mois de Vente</span>
          <h4 className="font-display font-extrabold text-lg sm:text-xl text-neutral-950 mt-1 uppercase tracking-wide">
            {bestMonthObj?.month}
          </h4>
          <p className="text-[10px] text-neutral-500 uppercase mt-2.5">
            Performance max : <span className="font-mono font-bold text-[#b8901c]">{selectedMetric === "sales" ? formatFCFA(bestMonthObj?.sales) : `${bestMonthObj?.orders} commandes`}</span>
          </p>
        </div>
      </div>

      {/* CHART & CATEGORIES DUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main D3 Chart Panel */}
        <div className="lg:col-span-8 bg-white p-6 border border-neutral-200 rounded-sm shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#d4af37] rounded-full"></div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-neutral-950">
                Courbe d'Évolution Mensuelle ({selectedYear})
              </h3>
            </div>
            {selectedYear === "2026" && (
              <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                Inclus Prévisions S2
              </span>
            )}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: "absolute",
                  left: tooltipPos.x + 10,
                  top: tooltipPos.y,
                  pointerEvents: "none"
                }}
                className="bg-neutral-950 text-white px-3 py-2.5 rounded-sm shadow-xl text-xs space-y-1 border border-neutral-850 z-20 min-w-44"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5 font-bold text-neutral-300">
                  <span>{hoveredBar.month}</span>
                  {hoveredBar.forecast && (
                    <span className="text-[7.5px] tracking-wider text-amber-300 border border-amber-300/35 px-1 py-0.1 select-none font-sans rounded-xs uppercase">Prévu</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-neutral-400">Chiffre d'Affaires:</span>
                  <span className="font-mono font-bold text-[#e1be52]">{formatFCFA(hoveredBar.sales)}</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-neutral-400">Commandes:</span>
                  <span className="font-mono font-bold text-white">{hoveredBar.orders}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Categories Breakdown Panel */}
        <div className="lg:col-span-4 bg-white p-6 border border-neutral-200 rounded-sm shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-neutral-950 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-[#d4af37]" />
                <span>Parts par Catégories ({selectedYear})</span>
              </h3>
            </div>

            <div className="space-y-4">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-800 line-clamp-1">{cat.category}</span>
                    <span className="font-mono text-[#b8901c]">{cat.share}%</span>
                  </div>
                  {/* Visual percentage progress bar */}
                  <div className="w-full bg-neutral-100 h-1.5 rounded-sm overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.share}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="bg-[#d4af37] h-full rounded-sm"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Part estimée</span>
                    <span className="font-mono">{formatFCFA(cat.sales)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-50 border border-neutral-150 p-3 rounded-sm mt-6 text-center">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Meilleure Vente : Mode</span>
            </p>
            <p className="text-[10.5px] text-neutral-600 mt-1 leading-relaxed">
              La mode représente près d'un tiers des transactions globales.
            </p>
          </div>
        </div>

      </div>

      {/* TABLE DES DONNÉES MENSUELLES COMPLÈTE */}
      <div className="bg-white p-6 border border-neutral-200 rounded-sm shadow-xs">
        <div className="flex justify-between items-center pb-4 border-b border-neutral-100 mb-4">
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-neutral-950 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#d4af37]" />
            <span>Tableau de Synthèse des Ventes</span>
          </h3>
          <span className="bg-neutral-100 border border-neutral-200 text-neutral-700 font-mono text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider">
            Consolidé {selectedYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 font-bold uppercase tracking-wider text-neutral-600 text-[10px]">
                <th className="py-3 px-4">Période Mensuelle</th>
                <th className="py-3 px-4 text-right">Chiffre d'Affaires (FCFA)</th>
                <th className="py-3 px-4 text-center">Volume Commandes</th>
                <th className="py-3 px-4 text-center">Panier Moyen</th>
                <th className="py-3 px-4 text-right">Statut Trimestre</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const isQ4 = idx >= 9;
                const isQ3 = idx >= 6 && idx < 9;
                const isQ2 = idx >= 3 && idx < 6;
                const isQ1 = idx < 3;
                let qLabel = "T1 (Lancement)";
                if (isQ2) qLabel = "T2 (Croissance)";
                if (isQ3) qLabel = "T3 (Stabilité)";
                if (isQ4) qLabel = "T4 (Fêtes de Fin d'Année)";

                return (
                  <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                    <td className="py-3.5 px-4 font-bold text-neutral-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-sm"></span>
                      <span>{row.month}</span>
                      {row.forecast && (
                        <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1.5 py-0.1 uppercase tracking-wider rounded-xs font-sans">
                          Ajusté / Prévu
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#b8901c]">
                      {formatFCFA(row.sales)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-900">
                      {row.orders} colis
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-neutral-600">
                      {formatFCFA(Math.round(row.sales / row.orders))}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                        isQ4 
                          ? "bg-[#d4af37]/10 text-[#af8a15] border border-[#d4af37]/20" 
                          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                      }`}>
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

    </div>
  );
}
