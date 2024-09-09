export default function DrawHelper({ compareChangeEnabled, onCompareChange }) {
  return (
    <div className="absolute top-2 right-10 z-10 bg-base-200 p-2 rounded-box">
      <p className="label-text">Draw a line to measure elevation change</p>
      <div className="flex items-center mt-2">
        <span className="label-text mr-2">Compare change through time</span>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={compareChangeEnabled}
          onChange={() => onCompareChange(!compareChangeEnabled)}
        />
      </div>
    </div>
  );
}
