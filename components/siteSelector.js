export default function SiteSelector({ selectedSite, onSiteSelect }) {
  const sites = ["Place Glacier", "Elliot Creek"];

  return (
    <div className="bg-base-200 p-2 rounded-box">
      <h3 className="label-text text-lg font-bold">Select a Site</h3>
      <div className="flex flex-col">
        {sites.map((site) => (
          <button
            key={site}
            onClick={() => onSiteSelect(site)}
            className={`btn btn-sm m-1 ${
              selectedSite === site ? "btn-primary" : "btn-ghost"
            }`}
          >
            {site}
          </button>
        ))}
      </div>
    </div>
  );
}
