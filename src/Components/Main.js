import { useEffect, useState } from "react";
import "./Main.css";
import Dashboard from "./dashboard";
import ScreenPet from "./ScreenPet";

const API_URL = "https://script.google.com/macros/s/AKfycbxSP7Wd5s6jhNCixo7IShuG4SDrTLwQxFBso7HYTBOSym_BsGimFkYMykQ29iVQdY2yBQ/exec";

function Main() {
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleList, setVehicleList] = useState(() => JSON.parse(localStorage.getItem("vehicles") || "[]"));
  const [screen, setScreen] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [isContinuing, setIsContinuing] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState(0);

  useEffect(() => {
    async function loadVehicles() {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}?vehicleNo=getAllVehicles`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setVehicleList(data);
          localStorage.setItem("vehicles", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Unable to load vehicle suggestions", error);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  const matches = vehicleList.filter((item) => item.toLowerCase().includes(vehicleNo.toLowerCase())).slice(0, 7);
  const submit = (event) => {
    event.preventDefault();
    if (!vehicleNo.trim()) {
      setNotice("Enter or select a vehicle number to continue.");
      return;
    }
    setNotice("");
    setIsContinuing(true);
    setTimeout(() => {
      setScreen("dashboard");
      setIsContinuing(false);
    }, 520);
  };

  const changeBackground = () => setBackgroundTheme((theme) => (theme + 1) % 4);

  return <div className={`loginPage theme${backgroundTheme}`}>
    <header className="header">
      <h1 className="title">VEHICLE SERVICE</h1>
      <button type="button" className="menuIcon" onClick={() => setMenuOpen(true)} aria-label="Open help menu">☰</button>
    </header>
    {screen === "login" ? <main className="loginDetails">
      <span className="eyebrow">SERVICE PORTAL</span>
      <h2 className="loginTitle">Welcome back</h2>
      <p className="loginSubtitle">Check the latest service details and maintain your vehicle record.</p>
      <form onSubmit={submit}>
        <label className="VelNo" htmlFor="vehicle-number">Vehicle number</label>
        <div className="vehicleAutocomplete">
          <input id="vehicle-number" className="velNoInput" value={vehicleNo} autoComplete="off" placeholder="e.g. TN 01 AB 1234"
            onChange={(event) => { setVehicleNo(event.target.value.toUpperCase()); setSuggestionsOpen(true); setNotice(""); }}
            onFocus={() => setSuggestionsOpen(true)} onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)} />
          {suggestionsOpen && matches.length > 0 && <div className="vehicleSuggestions" role="listbox">
            {matches.map((item) => <button type="button" className="vehicleSuggestion" key={item} onMouseDown={() => { setVehicleNo(item); setSuggestionsOpen(false); }}>{item}</button>)}
          </div>}
        </div>
        <button type="submit" className={`btn btn-primary btn-lg enterBtn ${isContinuing ? "isContinuing" : ""}`} disabled={isContinuing}>{isContinuing ? "Opening your record…" : loading ? "Loading suggestions..." : "Continue"}</button>
      </form>
      {notice && <p className="formNotice" role="alert">{notice}</p>}
      <p className="loginHint">You can type a new vehicle number even if it is not listed.</p>
    </main> : <main className="dashBoard"><Dashboard vehicleNo={vehicleNo} onLogout={() => setScreen("login")} /></main>}
    {menuOpen && <div className="menuOverlay" onClick={() => setMenuOpen(false)}>
      <aside className="menuContent" onClick={(event) => event.stopPropagation()} aria-label="Help desk">
        <button type="button" className="closeMenu" onClick={() => setMenuOpen(false)} aria-label="Close help menu">×</button>
        <span className="eyebrow">NEED HELP?</span><h2>Service portal guide</h2>
        <p>Search for a vehicle number to see its latest service record, update its details, and browse every previous service visit.</p>
        <p className="helpTip">Tip: use a full vehicle number for the most accurate result.</p>
      </aside>
    </div>}
    <ScreenPet onInteract={changeBackground} />
  </div>;
}

export default Main;
