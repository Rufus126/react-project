import { useState } from "react";
import "./ScreenPet.css";

function ScreenPet({ onInteract }) {
  const [message, setMessage] = useState("Hi! Need to update your service record?");
  const [open, setOpen] = useState(false);

  const cheer = () => {
    const messages = [
      "Hi! Need to update your service record?",
      "Keep your vehicle service on track!",
      "Your next ride deserves great care.",
    ];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    setOpen(true);
    onInteract?.();
  };

  return <div className="screenPet">
    {open && <div className="petBubble" role="status">{message}<button type="button" onClick={() => setOpen(false)} aria-label="Close message">×</button></div>}
    <button type="button" className="petRider" onClick={cheer} aria-label="Talk to your service rider">
      <span className="petRoad"></span>
      <span className="petBike"><i className="petWheel wheelOne"></i><i className="petWheel wheelTwo"></i><i className="petFrame"></i><i className="petHandle"></i></span>
      <span className="petPerson"><i className="petHelmet"></i><i className="petHead"></i><i className="petBody"></i><i className="petArm"></i></span>
    </button>
  </div>;
}

export default ScreenPet;
