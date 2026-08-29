import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Browsers restore the previous scroll offset on reload. That fights this
// app: the pages fetch their content after mount, so the restore lands once
// the page has grown tall enough - dropping the reader at the footer instead
// of the top. ScrollToTop already puts every navigation at the top, so take
// scroll over entirely rather than letting the two compete.
if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
