import D3Legend from "./legend";

export default function DEMLegend() {
  const gistEarthColormap = [
    "#000000",
    "#1E2A41",
    "#3C5282",
    "#5A7AC3",
    "#78A2E5",
    "#96CBF8",
    "#B4F3FF",
    "#D2FFE7",
    "#F0FFCF",
    "#FFFFB7",
    "#FFE89F",
    "#FFD187",
    "#FFBA6F",
    "#FFA357",
    "#FF8B3F",
    "#FF7427",
  ];

  return (
    <div className="absolute bottom-2 left-1/4 transform -translate-x-1/2 z-10 bg-white p-2 rounded-box shadow-md">
      <D3Legend min={0} max={2500} colormap={gistEarthColormap} />
    </div>
  );
}
