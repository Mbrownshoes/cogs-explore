export default function ElevationDisplay({ elevation }) {
  return (
    <div className="absolute top-2 left-1/3 transform -translate-x-1/2 z-10 bg-base-200 p-2 rounded-box">
      <h3 className="label-text text-lg font-bold">Elevation</h3>
      <p className="label-text">
        {elevation !== null && elevation > 0
          ? `${elevation.toFixed(2)} meters`
          : "Hover for elevation"}
      </p>
    </div>
  );
}
