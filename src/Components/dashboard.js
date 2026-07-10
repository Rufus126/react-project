import { useCallback, useEffect, useState } from "react";
import "./dashboard.css";
import History from "./history";

const API_URL = "https://script.google.com/macros/s/AKfycbxSP7Wd5s6jhNCixo7IShuG4SDrTLwQxFBso7HYTBOSym_BsGimFkYMykQ29iVQdY2yBQ/exec";
const emptyRecord = { date: "", vehicleType: "", service: "" };

function Dashboard({ vehicleNo, onLogout }) {
  const [record, setRecord] = useState(emptyRecord);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("details");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const hasSavedVehicleType = record.vehicleType === "Bike" || record.vehicleType === "Car";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?vehicleNo=${encodeURIComponent(vehicleNo)}`);
      const data = await response.json();
      const records = Array.isArray(data) ? data : [];
      setHistory(records);
      const latest = records[records.length - 1];
      setRecord(latest ? { date: latest.date ? latest.date.split("T")[0] : "", vehicleType: latest.vehicleType || "", service: latest.serviceDetails || "" } : emptyRecord);
    } catch (error) {
      console.error(error);
      setMessage("We could not load service details. Check your connection and try again.");
    } finally { setLoading(false); }
  }, [vehicleNo]);

  useEffect(() => { loadData(); }, [loadData]);
  const updateRecord = (field, value) => setRecord((current) => ({ ...current, [field]: value }));
  const save = async (event) => {
    event.preventDefault();
    if (!record.date || !record.vehicleType || !record.service.trim()) { setMessage("Complete the date, vehicle type, and service details before saving."); return; }
    setSaving(true); setMessage("");
    try {
      const body = new URLSearchParams({ vehicleNo, date: record.date, vehicleType: record.vehicleType, serviceDetails: record.service });
      const response = await fetch(API_URL, { method: "POST", body });
      if (!response.ok) throw new Error("Save failed");
      setEditing(false); setMessage("Service details saved successfully."); setShowCelebration(true); setTimeout(() => setShowCelebration(false), 1200); await loadData();
    } catch (error) { setMessage("Unable to save changes. Please try again."); }
    finally { setSaving(false); }
  };

  return <>
    <header className="vehicleInformation"><div><span className="eyebrow">CURRENT VEHICLE</span><h1>{vehicleNo}</h1></div><button type="button" className="logoutBtn" onClick={onLogout}>Switch vehicle</button></header>
    <section className="serviceDetails">
      <div className="sectionHeading"><div><span className="eyebrow">SERVICE STATUS</span><h2>{view === "history" ? "Service history" : "Latest service"}</h2></div>{view === "details" && <button type="button" className="btn btn-outline-primary" onClick={() => setEditing(true)}>Edit details</button>}</div>
      {message && <p className="statusMessage" role="status">{message}</p>}
      {loading ? <div className="loadingState"><span></span> Loading your service record…</div> : view === "history" ? <History history={history} onBack={() => setView("details")} /> : <>
        <div className="detailGrid"><div><span>Date</span><strong>{record.date || "No service recorded"}</strong></div><div><span>Vehicle type</span><strong>{record.vehicleType || "Not specified"}</strong></div></div>
        <div className="serviceNote"><span>Service details</span><p>{record.service || "No service details have been added yet. Use Edit details to create the first record."}</p></div>
        <button type="button" className="historyBtn" onClick={() => setView("history")}>View complete history <span>→</span></button>
      </>}
    </section>
    {editing && <div className="modalOverlay" onClick={() => setEditing(false)}><form className="serviceDetailsUpdate" onSubmit={save} onClick={(event) => event.stopPropagation()}><div className="sectionHeading"><h2>Update service</h2><button type="button" className="closeMenu" onClick={() => setEditing(false)}>×</button></div>
      <label>Date<input className="detailsUpdate" type="date" value={record.date} onChange={(event) => updateRecord("date", event.target.value)} /></label>
      {!hasSavedVehicleType && <fieldset><legend>Vehicle type</legend><label className="radioLabel"><input type="radio" name="type" checked={record.vehicleType === "Bike"} onChange={() => updateRecord("vehicleType", "Bike")} /> Bike</label><label className="radioLabel"><input type="radio" name="type" checked={record.vehicleType === "Car"} onChange={() => updateRecord("vehicleType", "Car")} /> Car</label></fieldset>}
      <label>Service details<textarea className="detailsUpdateTextarea" value={record.service} onChange={(event) => updateRecord("service", event.target.value)} placeholder="Describe the work completed" /></label>
      <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save service details"}</button>
    </form></div>}
    {showCelebration && <div className="saveCelebration" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ "--particle": index, "--rise": 110 + (index % 5) * 28 }} />)}</div>}
  </>;
}
export default Dashboard;
