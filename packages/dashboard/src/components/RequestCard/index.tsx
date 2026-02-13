import React, { useState } from "react";
import "./index.less";

interface RequestCardProps {
  data: any[];
}

export const RequestCard: React.FC<RequestCardProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const count = data?.length || 0;
  const color = count > 0 ? "#e0e0e0" : "#666";

  return (
    <div className="request-card">
      <div className="header">
        <div
          className="status-dot"
          style={{
            background: color,
          }}
        />
        <span className="title">Requests</span>
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
                  <span className="source-type">
                    {item.sourceType || "fetch"}
                  </span>
                </div>
                <div className="request-target" title={item.target}>
                  {item.target}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
