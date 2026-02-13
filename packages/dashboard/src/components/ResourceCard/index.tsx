import React, { useState } from "react";
import "./index.less";

interface ResourceCardProps {
  data: any[];
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const count = data?.length || 0;
  const color = count > 0 ? "#e0e0e0" : "#666";

  return (
    <div className="resource-card">
      <div className="header">
        <div className="status-dot" style={{ background: color }} />
        <span className="title">Resources</span>
      </div>

      <div className="content" style={{ color: color }}>
        <div>
          {count} <span className="count-unit">count</span>
        </div>
        {count > 0 && (
          <div className="toggle-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? "收起" : "详情"}
          </div>
        )}
      </div>

      {expanded && count > 0 && (
        <div className="details-list">
          {data.map((item, i) => (
            <div
              key={i}
              className={`list-item ${i < data.length - 1 ? "bordered" : ""}`}
            >
              <div className="item-header">
                <div className="left-group">
                  <span className="duration">{item.duration.toFixed(2)}ms</span>
                  <span className="initiator-type">{item.initiatorType}</span>
                </div>
                <div className="resource-name" title={item.resourceName}>
                  {item.resourceName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
