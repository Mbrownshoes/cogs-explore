export default function LayerSelector({
  layers,
  selectedLayer,
  onLayerSelect,
}) {
  return (
    <div className="flex flex-col bg-base-200 w-40 p-2 rounded-box">
      <h3 className="label-text text-lg font-bold">Layers</h3>
      {Object.keys(layers).map((layer) => (
        <div key={layer} className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">{layer}</span>
            <input
              type="radio"
              name="radio-10"
              className="radio checked:bg-red-500"
              checked={layer === selectedLayer}
              onChange={() => onLayerSelect(layer)}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
