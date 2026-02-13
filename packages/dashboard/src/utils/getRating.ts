// 获取指标评级
export const getRating = (name: string, value: number) => {
  if (value === -1) return "unknown";
  switch (name) {
    case "LCP":
      return value <= 2500
        ? "good"
        : value <= 4000
          ? "needs-improvement"
          : "poor";
    case "Load":
      return value <= 2500
        ? "good"
        : value <= 5000
          ? "needs-improvement"
          : "poor";
    case "CLS":
      return value <= 0.1
        ? "good"
        : value <= 0.25
          ? "needs-improvement"
          : "poor";
    case "INP":
      return value <= 200
        ? "good"
        : value <= 500
          ? "needs-improvement"
          : "poor";
    case "FCP":
      return value <= 1800
        ? "good"
        : value <= 3000
          ? "needs-improvement"
          : "poor";
    case "TTFB":
      return value <= 800
        ? "good"
        : value <= 1800
          ? "needs-improvement"
          : "poor";
    case "FID":
      return value <= 100
        ? "good"
        : value <= 300
          ? "needs-improvement"
          : "poor";
    case "FP":
      return value <= 1800
        ? "good"
        : value <= 3000
          ? "needs-improvement"
          : "poor";
    default:
      return "unknown";
  }
};

export const getStatusColor = (rating: string) => {
  switch (rating) {
    case "good":
      return "#0cce6b"; // Green
    case "needs-improvement":
      return "#ffa400"; // Orange
    case "poor":
      return "#ff4e42"; // Red
    default:
      return "#888"; // Grey
  }
};
