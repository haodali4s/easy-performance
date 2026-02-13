import React from "react";
import { getRating, getStatusColor } from "../../utils/getRating";
import "./index.less";

interface TimeCardProps {
  title: string;
  name: string;
  unit?: string;
  metrics: any;
  target?: boolean;
}

export const TimeCard: React.FC<TimeCardProps> = ({
  title,
  name,
  unit = "ms",
  metrics,
  target = false,
}) => {
  const metric =
    metrics && metrics[name] && metrics[name][0] ? metrics[name][0] : null;

  if (!metric) {
    return (
      <div className="time-card loading">
        <div className="header small-gap">
          <div className="loading-dot" />
          <span className="title">{title}</span>
        </div>
        <div className="loading-value">--</div>
      </div>
    );
  }

  const value = metric.value || -1;
  const rating = getRating(name, value);
  const color = getStatusColor(rating);
  const displayValue =
    unit === "s" ? (value / 1000).toFixed(4) : value.toFixed(2);

  const renderIcon = () => {
    switch (rating) {
      case "good":
        return <div className="status-dot" style={{ background: color }} />;
      case "needs-improvement":
        return <div className="status-dot" style={{ background: color }} />;
      case "poor":
        return (
          <div
            className="status-triangle"
            style={{ borderBottom: `10px solid ${color}` }}
          />
        );
      default:
        return <div className="status-dot" style={{ background: "#888" }} />;
    }
  };

  return (
    <div className="time-card">
      <div className="header">
        {renderIcon()}
        <span className="title">{title}</span>
      </div>
      <div className="value" style={{ color: color }}>
        {displayValue} <span className="unit">{unit}</span>
      </div>
      <div className="target-element" title={metric.elementSelector}>
        {target && <>元素: {metric.elementSelector}</>}
      </div>
    </div>
  );
};
