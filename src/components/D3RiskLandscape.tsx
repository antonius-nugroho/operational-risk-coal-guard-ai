import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { LossEvent, MonteCarloOpportunityResult } from '../types/riskModel';
import { Activity, Info, ZoomIn, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { formatCurrencyIDR, formatDateID, formatHoursID, formatNumberID } from '../lib/formatters';

interface D3RiskLandscapeProps {
  historicalEvents: LossEvent[];
  monteCarlo: MonteCarloOpportunityResult;
}

export const D3RiskLandscape: React.FC<D3RiskLandscapeProps> = ({
  historicalEvents,
  monteCarlo,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<LossEvent | null>(null);
  const [showKDE, setShowKDE] = useState(true);
  const [showRug, setShowRug] = useState(true);
  const [showVaRLimits, setShowVaRLimits] = useState(true);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous renders
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 800;
    const height = 340;
    const margin = { top: 30, right: 35, bottom: 50, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Defs for gradients & shadow
    const defs = svg.append('defs');

    // Gradient for density curve
    const densityGradient = defs
      .append('linearGradient')
      .attr('id', 'density-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    densityGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.55);

    densityGradient
      .append('stop')
      .attr('offset', '45%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.65);

    densityGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ef4444')
      .attr('stop-opacity', 0.85);

    // Glow filter for dots
    const filter = defs.append('filter').attr('id', 'glow');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (!historicalEvents || historicalEvents.length === 0) {
      g.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', '#090d16')
        .attr('rx', 8)
        .attr('stroke', '#1e293b')
        .attr('stroke-dasharray', '4,4');

      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2 - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f1f5f9')
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .text('No Historical Failure Events Loaded');

      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2 + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '11px')
        .text('Previous datasets were cleared. Upload fresh Failure Data (.xlsx / .csv) to stream to BigQuery coal_guard_analytics.failure_events and project the empirical probability density landscape.');
      return;
    }

    // Prepare loss data in millions ($M)
    const lossValuesM = historicalEvents.map((e) => e.financialLossUSD / 1000000);
    const maxHistoricalLossM = Math.max(...lossValuesM, 0.5);
    const p90M = (monteCarlo.percentileP90USD || 5000000) / 1000000;
    const p50M = (monteCarlo.percentileP50USD || 2500000) / 1000000;
    const p10M = (monteCarlo.percentileP10USD || 800000) / 1000000;

    const xMax = Math.max(maxHistoricalLossM * 1.25, p90M * 1.35, 5);

    // Scales
    const xScale = d3.scaleLinear().domain([0, xMax]).range([0, innerWidth]).nice();

    // Kernel Density Estimation (KDE) using Epanechnikov or Gaussian Kernel
    function kernelDensityEstimator(kernel: (v: number) => number, X: number[]) {
      return function (V: number[]) {
        return X.map((x) => [x, d3.mean(V, (v) => kernel(x - v)) || 0] as [number, number]);
      };
    }

    function kernelEpanechnikov(bandwidth: number) {
      return function (v: number) {
        const u = v / bandwidth;
        return Math.abs(u) <= 1 ? (0.75 * (1 - u * u)) / bandwidth : 0;
      };
    }

    // Dynamic bandwidth (Silverman's rule of thumb)
    const sampleStd = d3.deviation(lossValuesM) || 1.2;
    const bandwidth = Math.max(0.4, 1.06 * sampleStd * Math.pow(Math.max(4, lossValuesM.length), -0.2));

    const xTicks = xScale.ticks(100);
    const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), xTicks);
    const density = kde(lossValuesM);

    const maxDensity = d3.max(density, (d) => d[1]) || 0.1;
    const yScale = d3.scaleLinear().domain([0, maxDensity * 1.2]).range([innerHeight, 0]);

    // Grid lines
    const yAxisGrid = d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid text-slate-800 opacity-30')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '2,2');

    // Area & Line Generators
    const area = d3
      .area<[number, number]>()
      .curve(d3.curveBasis)
      .x((d) => xScale(d[0]))
      .y0(innerHeight)
      .y1((d) => yScale(d[1]));

    const line = d3
      .line<[number, number]>()
      .curve(d3.curveBasis)
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    // Render KDE Density Area
    if (showKDE) {
      // Shaded area under the curve
      g.append('path')
        .datum(density)
        .attr('fill', 'url(#density-gradient)')
        .attr('fill-opacity', 0.25)
        .attr('d', area);

      // Smooth line on top
      g.append('path')
        .datum(density)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2.5)
        .attr('d', line);
    }

    // Value-at-Risk (VaR) vertical benchmark thresholds
    if (showVaRLimits) {
      const thresholds = [
        { label: 'P10 Optimistic', value: p10M, color: '#10b981', dash: '3,3' },
        { label: 'P50 Expected (VaR)', value: p50M, color: '#f59e0b', dash: '4,4' },
        { label: 'P90 Severe Tail', value: p90M, color: '#ef4444', dash: '5,5' },
      ];

      thresholds.forEach((th) => {
        const xPos = xScale(th.value);
        if (xPos >= 0 && xPos <= innerWidth) {
          // Line
          g.append('line')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', 0)
            .attr('y2', innerHeight)
            .attr('stroke', th.color)
            .attr('stroke-width', 1.8)
            .attr('stroke-dasharray', th.dash)
            .attr('opacity', 0.85);

          // Top label badge
          const labelG = g.append('g').attr('transform', `translate(${xPos}, 10)`);

          labelG
            .append('rect')
            .attr('x', -45)
            .attr('y', -10)
            .attr('width', 90)
            .attr('height', 16)
            .attr('rx', 3)
            .attr('fill', '#0f172a')
            .attr('stroke', th.color)
            .attr('stroke-width', 1)
            .attr('opacity', 0.9);

          labelG
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '2px')
            .attr('fill', th.color)
            .attr('font-size', '9px')
            .attr('font-weight', '700')
            .attr('font-family', 'monospace')
            .text(`${th.label.split(' ')[0]} ${formatCurrencyIDR(th.value * 1000000, { compact: true })}`);
        }
      });
    }

    // Rug Plot (bottom tick marks for raw events)
    if (showRug) {
      g.selectAll('.rug-mark')
        .data(historicalEvents)
        .enter()
        .append('line')
        .attr('class', 'rug-mark')
        .attr('x1', (d) => xScale(d.financialLossUSD / 1000000))
        .attr('x2', (d) => xScale(d.financialLossUSD / 1000000))
        .attr('y1', innerHeight)
        .attr('y2', innerHeight + 8)
        .attr('stroke', (d) => (d.severity === 'Catastrophic' ? '#ef4444' : d.severity === 'High' ? '#f97316' : '#38bdf8'))
        .attr('stroke-width', 2)
        .attr('opacity', 0.8);
    }

    // Historical Loss Events Scatter / Bubbles plotted along the curve
    // For each loss event, interpolate its density height so it rests along the risk terrain
    const eventPoints = historicalEvents.map((evt) => {
      const valM = evt.financialLossUSD / 1000000;
      // Find nearest density point
      const closest = density.reduce((prev, curr) =>
        Math.abs(curr[0] - valM) < Math.abs(prev[0] - valM) ? curr : prev
      );
      return {
        event: evt,
        xVal: valM,
        yVal: closest ? closest[1] : 0,
      };
    });

    const bubbles = g
      .selectAll('.event-bubble')
      .data(eventPoints)
      .enter()
      .append('g')
      .attr('class', 'event-bubble')
      .attr('transform', (d) => `translate(${xScale(d.xVal)}, ${yScale(d.yVal)})`)
      .style('cursor', 'pointer')
      .on('mouseenter', (_e, d) => setHoveredEvent(d.event))
      .on('mouseleave', () => setHoveredEvent(null));

    // Outer pulsating halo for high severity
    bubbles
      .filter((d) => d.event.severity === 'Catastrophic' || d.event.severity === 'High')
      .append('circle')
      .attr('r', (d) => Math.min(18, 6 + Math.sqrt(d.event.forcedOutageHours) * 1.2))
      .attr('fill', (d) => (d.event.severity === 'Catastrophic' ? '#ef4444' : '#f97316'))
      .attr('fill-opacity', 0.2)
      .attr('stroke', (d) => (d.event.severity === 'Catastrophic' ? '#ef4444' : '#f97316'))
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Inner circle
    bubbles
      .append('circle')
      .attr('r', (d) => Math.min(12, 4.5 + Math.sqrt(d.event.forcedOutageHours) * 0.8))
      .attr('fill', (d) => {
        if (d.event.severity === 'Catastrophic') return '#ef4444';
        if (d.event.severity === 'High') return '#f97316';
        if (d.event.severity === 'Medium') return '#eab308';
        return '#38bdf8';
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#glow)');

    // Category initials inside circle
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '3px')
      .attr('fill', '#ffffff')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d) => `${formatNumberID(d.event.forcedOutageHours, 0)}j`);

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(7)
      .tickFormat((d) => formatCurrencyIDR(Number(d) * 1000000, { compact: true }));

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // X Axis Title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Besaran Kerugian Finansial / Realized Loss (Indonesian Rupiah - Rp)');

    // Y Axis (format probability density ticks with comma decimal)
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => formatNumberID(Number(d), 2));

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    // Y Axis Title
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Empirical Probability Density f(x)');

  }, [historicalEvents, monteCarlo, showKDE, showRug, showVaRLimits]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Risk Landscape: Empirical Probability Density vs. Historical Loss Events
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous Kernel Density Estimation (KDE) curve overlaying discrete historical plant trip events and Monte Carlo tail thresholds.
          </p>
        </div>

        {/* View toggles */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setShowKDE(!showKDE)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
              showKDE 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showKDE ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
            <span>KDE Curve</span>
          </button>

          <button
            onClick={() => setShowVaRLimits(!showVaRLimits)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
              showVaRLimits 
                ? 'bg-red-500/15 border-red-500/40 text-red-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showVaRLimits ? <Eye className="w-3 h-3 text-red-400" /> : <EyeOff className="w-3 h-3" />}
            <span>VaR Lines (P10/50/90)</span>
          </button>

          <button
            onClick={() => setShowRug(!showRug)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
              showRug 
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showRug ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
            <span>Rug Marks</span>
          </button>
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div ref={containerRef} className="relative w-full bg-slate-950/60 rounded-lg border border-slate-800/80 p-2">
        <svg ref={svgRef} className="w-full h-auto overflow-visible"></svg>

        {/* Floating Tooltip card when an event node is hovered */}
        {hoveredEvent && (
          <div className="absolute top-4 right-4 z-20 max-w-sm bg-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-lg p-3 shadow-2xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-amber-400 font-mono">{hoveredEvent.unit} • {formatDateID(hoveredEvent.date)}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                hoveredEvent.severity === 'Catastrophic' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                hoveredEvent.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                'bg-slate-800 text-slate-300'
              }`}>
                {hoveredEvent.severity}
              </span>
            </div>
            <div className="font-semibold text-white">{hoveredEvent.category}</div>
            <div className="flex justify-between text-slate-300 font-mono text-[11px]">
              <span>Kerugian: <strong className="text-red-400">{formatCurrencyIDR(hoveredEvent.financialLossUSD)}</strong></span>
              <span>Durasi: <strong className="text-amber-300">{formatHoursID(hoveredEvent.forcedOutageHours)}</strong></span>
            </div>
            <div className="text-slate-400 text-[11px] leading-tight pt-1">
              <strong className="text-slate-300">Root Cause:</strong> {hoveredEvent.rootCause}
            </div>
            <div className="text-emerald-400 text-[10px] pt-0.5 font-medium">
              Sensor Vector: {hoveredEvent.detectedBy}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Analytical Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Catastrophic Loss
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High Severity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Bubble size = Forced Outage Duration (hrs)
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 italic">
          <Info className="w-3 h-3 text-amber-500/80" />
          <span>Calculated via Epanechnikov Kernel on {historicalEvents.length} historical outages. Hover any node to view event RCA.</span>
        </div>
      </div>

    </div>
  );
};
