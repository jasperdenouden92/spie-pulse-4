'use client';

import React, { useState } from 'react';
import { useDrawingArea, useYScale, useXScale } from '@mui/x-charts/hooks';

// ── Horizontal threshold gradient (colors area by X based on data value) ──

export function HorizontalThresholdGradient({ data, goodAbove, moderateAbove, id, goodColor = '#66bb6a', moderateColor = '#ffa726', poorColor = '#ef5350' }: { data: number[]; goodAbove: number; moderateAbove: number; id: string; goodColor?: string; moderateColor?: string; poorColor?: string }) {
  const { left, width } = useDrawingArea();
  const n = data.length;
  const getOffset = (i: number) => i / (n - 1);
  const getColor = (value: number) => {
    if (value >= goodAbove) return goodColor;
    if (value >= moderateAbove) return moderateColor;
    return poorColor;
  };

  const stops: { offset: number; color: string }[] = [];

  for (let i = 0; i < n; i++) {
    if (i > 0) {
      const prevVal = data[i - 1];
      const currVal = data[i];
      const prevOffset = getOffset(i - 1);
      const currOffset = getOffset(i);

      const crossings: { t: number }[] = [];
      for (const threshold of [moderateAbove, goodAbove]) {
        if ((prevVal < threshold && currVal >= threshold) || (prevVal >= threshold && currVal < threshold)) {
          crossings.push({ t: (threshold - prevVal) / (currVal - prevVal) });
        }
      }
      crossings.sort((a, b) => a.t - b.t);

      for (const { t } of crossings) {
        const crossOffset = prevOffset + t * (currOffset - prevOffset);
        const valBefore = prevVal + (currVal - prevVal) * (t - 0.001);
        const valAfter = prevVal + (currVal - prevVal) * (t + 0.001);
        stops.push({ offset: crossOffset, color: getColor(valBefore) });
        stops.push({ offset: crossOffset, color: getColor(valAfter) });
      }
    }
    stops.push({ offset: getOffset(i), color: getColor(data[i]) });
  }

  stops.sort((a, b) => a.offset - b.offset);

  return (
    <defs>
      <linearGradient id={id} x1={left} x2={left + width} y1="0" y2="0" gradientUnits="userSpaceOnUse">
        {stops.map((s, i) => (
          <stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={1} />
        ))}
      </linearGradient>
    </defs>
  );
}

// ── Interactive threshold line with hover tooltip ──

export function InteractiveThresholdLine({ y, label }: { y: number; label: string }) {
  const { left, width } = useDrawingArea();
  const scale = useYScale() as import('@mui/x-charts-vendor/d3-scale').ScaleLinear<number, number>;
  const [hovered, setHovered] = useState(false);

  const yPos = scale(y) as number;

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <line
        x1={left}
        x2={left + width}
        y1={yPos}
        y2={yPos}
        stroke="transparent"
        strokeWidth={12}
        style={{ cursor: 'pointer' }}
      />
      <line
        x1={left}
        x2={left + width}
        y1={yPos}
        y2={yPos}
        stroke={hovered ? '#999' : '#ccc'}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        style={{ transition: 'stroke 0.15s ease', pointerEvents: 'none' }}
      />
      {hovered && (
        <g>
          <rect
            x={left + width / 2 - 60}
            y={yPos - 28}
            width={120}
            height={22}
            rx={4}
            fill="#333"
            opacity={0.9}
          />
          <text
            x={left + width / 2}
            y={yPos - 14}
            textAnchor="middle"
            fill="white"
            fontSize={11}
            fontWeight={500}
            style={{ pointerEvents: 'none' }}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

// ── Chart hover overlay (Notion-style) ──

export function ChartHoverOverlay({ data, labels, getColor }: { data: number[]; labels: string[]; getColor: (v: number) => string }) {
  const { left, top, width, height } = useDrawingArea();
  const yScale = useYScale() as import('@mui/x-charts-vendor/d3-scale').ScaleLinear<number, number>;
  const xScale = useXScale() as unknown as import('@mui/x-charts-vendor/d3-scale').ScalePoint<string>;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const n = data.length;
  const step = width / (n - 1);
  const bandWidth = step;

  return (
    <g>
      {labels.map((label, i) => {
        const xCenter = xScale(label) as number;
        return (
          <rect
            key={label}
            x={xCenter - bandWidth / 2}
            y={top}
            width={bandWidth}
            height={height}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        );
      })}

      {hoveredIndex !== null && (() => {
        const xCenter = xScale(labels[hoveredIndex]) as number;
        const value = data[hoveredIndex];
        const yPos = yScale(value) as number;
        const dotColor = getColor(value);

        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect
              x={xCenter - bandWidth / 2}
              y={top}
              width={bandWidth}
              height={height}
              fill="#000"
              opacity={0.04}
              rx={2}
            />

            <circle cx={xCenter} cy={yPos} r={5} fill={dotColor} stroke="white" strokeWidth={2} />

            {(() => {
              const tooltipW = 100;
              const tooltipH = 32;
              const gap = 12;
              let tooltipX = xCenter - tooltipW / 2;
              let tooltipY = yPos - tooltipH - gap;
              if (tooltipX < left) tooltipX = left;
              if (tooltipX + tooltipW > left + width) tooltipX = left + width - tooltipW;
              if (tooltipY < top) tooltipY = yPos + gap;

              return (
                <g>
                  <rect x={tooltipX} y={tooltipY} width={tooltipW} height={tooltipH} rx={6} fill="#000" opacity={0.08} transform="translate(0, 2)" />
                  <rect x={tooltipX} y={tooltipY} width={tooltipW} height={tooltipH} rx={6} fill="white" stroke="#e0e0e0" strokeWidth={1} />
                  <rect x={tooltipX + 10} y={tooltipY + tooltipH / 2 - 5} width={10} height={10} rx={2} fill={dotColor} />
                  <text x={tooltipX + 26} y={tooltipY + tooltipH / 2 + 1} dominantBaseline="middle" fill="#333" fontSize={12} fontWeight={500}>
                    {labels[hoveredIndex]}
                  </text>
                  <text x={tooltipX + tooltipW - 10} y={tooltipY + tooltipH / 2 + 1} dominantBaseline="middle" textAnchor="end" fill="#333" fontSize={12} fontWeight={600}>
                    {value}%
                  </text>
                </g>
              );
            })()}
          </g>
        );
      })()}
    </g>
  );
}
