import React, { useState } from "react";
import "./index.less";

interface LongTaskCardProps {
  tasks: any[];
}

export const LongTaskCard: React.FC<LongTaskCardProps> = ({ tasks }) => {
  const [expanded, setExpanded] = useState(false);
  const count = tasks?.length || 0;

  const color = count > 0 ? "#e0e0e0" : "#666";

  return (
    <div className="long-task-card">
      <div className="header">
        <div
          className="status-dot"
          style={{
            background: color,
          }}
        />
        <span className="title">Long Tasks</span>
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
          {tasks.map((task, i) => {
            const attribution =
              task.attribution && task.attribution[0]
                ? task.attribution[0]
                : null;
            return (
              <div
                key={i}
                className={`list-item ${
                  i < tasks.length - 1 ? "bordered" : ""
                }`}
              >
                <div className="item-header">
                  <span className="duration">
                    {Math.round(task.duration)}ms
                  </span>
                  {attribution && (
                    <>
                      <span className="context-info">
                        {attribution.containerType}
                      </span>
                      <span className="entry-type">
                        {attribution.entryType}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
