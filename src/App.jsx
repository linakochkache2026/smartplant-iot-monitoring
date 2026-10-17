
import { useEffect, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import {
  Leaf, Droplets, Thermometer, Wind, Activity,
  Wifi, RefreshCw, Sprout, Cloud, Clock
} from "lucide-react";
import "./App.css";

// Configuration ThingSpeak : complète après avoir créé ton canal.
// Laisse CHANNEL_ID vide pour utiliser les données de démonstration.
const CHANNEL_ID = "3540715";
const REFRESH_MS = 20000;

const demoData = Array.from({ length: 12 }, (_, i) => ({
  time: `${String(9 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
  soil: [42, 40, 37, 34, 29, 27, 32, 36, 41, 44, 42, 39][i],
  temperature: [23, 23.2, 23.5, 24, 24.2, 24.5, 24.1, 24, 23.8, 23.5, 23.4, 23.2][i],
  humidity: [48, 47, 46, 45, 44, 43, 44, 45, 46, 47, 48, 49][i],
  pump: 0,
}));

function formatTime(value) {
  if (!value) return "--:--";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
}

function MetricCard({ title, value, unit, icon: Icon, color, note }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{title}</span>
        <span className={`metric-icon ${color}`}><Icon size={21} /></span>
      </div>
      <div className="metric-value">
        {value}<span>{unit}</span>
      </div>
      <p className="metric-note">{note}</p>
    </article>
  );
}

export default function App() {
  const [data, setData] = useState(demoData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cloudError, setCloudError] = useState("");

  const demoMode = !CHANNEL_ID.trim();
  const latest = data[data.length - 1] || demoData[demoData.length - 1];
  const soil = Number(latest.soil);
  const pumpOn = Number(latest.pump) === 1;

  const soilStatus =
    soil < 30 ? "Sol sec" : soil < 40 ? "À surveiller" : "Sol humide";
  const soilClass =
    soil < 30 ? "danger" : soil < 40 ? "warning" : "healthy";

  async function loadData() {
    if (demoMode) {
      setLastUpdated(new Date());
      return;
    }

    setLoading(true);
    try {
      const url =
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=20`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Impossible de lire le canal ThingSpeak.");

      const result = await response.json();
      const feeds = (result.feeds || [])
        .filter((feed) => feed.field1 !== null)
        .map((feed) => ({
          time: formatTime(feed.created_at),
          soil: Number(feed.field1),
          temperature: Number(feed.field2),
          humidity: Number(feed.field3),
          pump: Number(feed.field4 || 0),
        }))
        .filter((item) => Number.isFinite(item.soil));

      if (!feeds.length) {
        throw new Error("Aucune mesure disponible dans le canal.");
      }

      setData(feeds);
      setCloudError("");
      setLastUpdated(new Date());
    } catch (error) {
      setCloudError(error.message || "Erreur de connexion au cloud.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    if (demoMode) return undefined;
    const timer = setInterval(loadData, REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Leaf size={25} /></div>
          <div><strong>SmartPlant</strong><small>SMART GROWING</small></div>
        </div>

        <div className="nav-caption">ESPACE DE TRAVAIL</div>
        <div className="nav-item active"><Activity size={18} /> Vue d'ensemble</div>
        <div className="nav-item"><Droplets size={18} /> Irrigation</div>
        <div className="nav-item"><Cloud size={18} /> Données cloud</div>

        <div className="sidebar-bottom">
          <div className="plant-illustration"><Sprout size={30} /></div>
          <strong>Chaque goutte compte.</strong>
          <p>Surveille les conditions de ta plante et optimise l'arrosage.</p>
          <span className="prototype-tag">PROTOTYPE IoT</span>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">SmartPlant <span>/</span> Tableau de bord</div>
            <h1>Vue d'ensemble</h1>
            <p className="subtitle">Voici l'état actuel de ton environnement végétal.</p>
          </div>
          <div className="top-actions">
            <span className={`connection-pill ${demoMode ? "demo" : cloudError ? "offline" : "online"}`}>
              <span className="status-dot" />
              {demoMode ? "Démonstration" : cloudError ? "Connexion à vérifier" : "ThingSpeak"}
            </span>
            <button className="refresh-button" onClick={loadData} disabled={loading}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              Actualiser
            </button>
          </div>
        </header>

        {demoMode && (
          <div className="notice">
            <Cloud size={19} />
            <div><strong>Mode démonstration</strong><p>Les valeurs affichées sont fictives. Ajoute l'identifiant de ton canal public ThingSpeak dans App.jsx pour afficher les mesures de la simulation.</p></div>
          </div>
        )}

        {cloudError && (
          <div className="error-notice" role="alert">
            {cloudError} Vérifie l'identifiant du canal et son accès public.
          </div>
        )}

        <div className="section-heading">
          <div><h2>Conditions environnementales</h2><p>Indicateurs clés de ton système</p></div>
          <span className="updated"><Clock size={14} /> {lastUpdated ? `Mis à jour à ${lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "En attente"}</span>
        </div>

        <div className="metrics-grid">
          <MetricCard title="Humidité du sol" value={soil} unit="%" icon={Droplets} color="blue" note={soilStatus} />
          <MetricCard title="Température de l'air" value={Number.isFinite(Number(latest.temperature)) ? Number(latest.temperature).toFixed(1) : "--"} unit="°C" icon={Thermometer} color="orange" note="Température mesurée" />
          <MetricCard title="Humidité de l'air" value={Number.isFinite(Number(latest.humidity)) ? Number(latest.humidity).toFixed(1) : "--"} unit="%" icon={Wind} color="purple" note="Humidité ambiante" />
        </div>

        <div className="content-grid">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div><h2>Évolution des mesures</h2><p>Historique des dernières lectures</p></div>
              <span className="live-label"><span /> {demoMode ? "Exemple" : "Canal cloud"}</span>
            </div>
            <div className="chart-legend">
              <span><i className="legend-blue" /> Sol (%)</span>
              <span><i className="legend-orange" /> Température (°C)</span>
              <span><i className="legend-purple" /> Air (%)</span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="soilFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2e9d75" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#2e9d75" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#edf1ed" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: "#8a958d", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8a958d", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5ebe6", fontSize: 12 }} />
                  <Area type="monotone" dataKey="soil" name="Sol (%)" stroke="#2e9d75" strokeWidth={2.5} fill="url(#soilFill)" />
                  <Area type="monotone" dataKey="temperature" name="Température (°C)" stroke="#e6a04b" strokeWidth={2} fill="transparent" />
                  <Area type="monotone" dataKey="humidity" name="Air (%)" stroke="#8b7bd8" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="chart-footnote">Les courbes partagent une même échelle verticale : les unités sont différentes.</p>
          </article>

          <article className="panel irrigation-panel">
            <div className="panel-heading"><div><h2>Irrigation</h2><p>État de l'indicateur de pompe</p></div><Droplets size={20} color="#359d79" /></div>
            <div className={`pump-visual ${pumpOn ? "pump-active" : ""}`}>
              <div className="pump-ring"><Droplets size={40} /></div>
              <span className={`pump-status ${pumpOn ? "on" : "off"}`}>{pumpOn ? "ACTIVÉE" : "ARRÊTÉE"}</span>
            </div>
            <div className="irrigation-details">
              <div><span>Humidité actuelle</span><strong>{soil}%</strong></div>
              <div><span>Seuil d'activation</span><strong>&lt; 30%</strong></div>
              <div><span>Seuil d'arrêt</span><strong>≥ 40%</strong></div>
            </div>
            <div className={`soil-advice ${soilClass}`}>
              <strong>{soilStatus}</strong>
              <p>{soil < 30 ? "Le seuil d'activation est atteint selon la logique du prototype." : soil < 40 ? "La valeur est dans la zone intermédiaire : l'état précédent est conservé." : "Le sol est au-dessus du seuil d'arrêt du prototype."}</p>
            </div>
            <p className="small-disclaimer">L'état de pompe est simulé par une LED dans Wokwi, pas par une vraie pompe.</p>
          </article>
        </div>

        <footer className="footer">
          <span><Leaf size={15} /> SmartPlant <span className="footer-separator">·</span> Projet étudiant IoT</span>
          <span><Wifi size={15} /> ESP32 · Wokwi · ThingSpeak</span>
        </footer>
      </section>
    </main>
  );
}
