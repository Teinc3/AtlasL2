import { useState } from "react"

import "./infopanel.css"


export default function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return <button
      className="infoButton"
      onClick={() => setIsOpen(true)}
    >i</button>;
  }

  return (
    <div className="infoPanel">
      Hello World!
    </div>
  )
}
