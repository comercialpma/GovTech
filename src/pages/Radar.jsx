import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Icon from '../components/Icon.jsx';

// Coordenadas centradas em Contagem - MG
const demands = [
  { id: 'PRT-9041', lat: -19.9317, lng: -44.0536, title: 'Poda de árvore', category: 'Urbanismo', status: 'Em Análise', priority: 'Média', district: 'Centro' },
  { id: 'PRT-9038', lat: -19.9355, lng: -44.0570, title: 'Buraco na via', category: 'Infraestrutura', status: 'Encaminhado', priority: 'Alta', district: 'Centro' },
  { id: 'PRT-8892', lat: -19.9220, lng: -44.0450, title: 'Iluminação pública', category: 'Iluminação', status: 'Concluído', priority: 'Baixa', district: 'Eldorado' },
  { id: 'PRT-8870', lat: -19.9180, lng: -44.0620, title: 'Vazamento de água', category: 'Saneamento', status: 'Crítico', priority: 'Crítica', district: 'Cidade Industrial' },
  { id: 'PRT-8855', lat: -19.9420, lng: -44.0680, title: 'Coleta de entulho', category: 'Limpeza', status: 'Em Análise', priority: 'Média', district: 'Riacho das Pedras' },
  { id: 'PRT-8841', lat: -19.9510, lng: -44.0420, title: 'Falta de insumos UBS', category: 'Saúde', status: 'Crítico', priority: 'Crítica', district: 'Nacional' },
  { id: 'PRT-8820', lat: -19.9280, lng: -44.0380, title: 'Semáforo apagado', category: 'Trânsito', status: 'Encaminhado', priority: 'Alta', district: 'Industrial' },
  { id: 'PRT-8795', lat: -19.9100, lng: -44.0520, title: 'Praça depredada', category: 'Urbanismo', status: 'Em Análise', priority: 'Média', district: 'Inconfidentes' },
  { id: 'PRT-8770', lat: -19.9460, lng: -44.0850, title: 'Esgoto a céu aberto', category: 'Saneamento', status: 'Crítico', priority: 'Crítica', district: 'Petrolândia' },
  { id: 'PRT-8754', lat: -19.9620, lng: -44.0710, title: 'Acessibilidade em calçada', category: 'Mobilidade', status: 'Encaminhado', priority: 'Alta', district: 'Sapucaias' },
  { id: 'PRT-8730', lat: -19.9050, lng: -44.0780, title: 'Vandalismo em escola', category: 'Educação', status: 'Em Análise', priority: 'Média', district: 'Vargem das Flores' },
  { id: 'PRT-8715', lat: -19.9380, lng: -44.0480, title: 'Iluminação parque', category: 'Iluminação', status: 'Concluído', priority: 'Baixa', district: 'Cabral' },
  { id: 'PRT-8702', lat: -19.9560, lng: -44.0950, title: 'Lixo acumulado', category: 'Limpeza', status: 'Crítico', priority: 'Crítica', district: 'Nova Contagem' },
  { id: 'PRT-8688', lat: -19.9290, lng: -44.0660, title: 'Falta de remédios', category: 'Saúde', status: 'Em Análise', priority: 'Alta', district: 'Jardim Industrial' },
  { id: 'PRT-8672', lat: -19.9410, lng: -44.0560, title: 'Asfalto danificado', category: 'Infraestrutura', status: 'Encaminhado', priority: 'Alta', district: 'Inconfidentes' },
];

const statusColors = {
  'Crítico': '#dc2626',
  'Em Análise': '#0051d5',
  'Encaminhado': '#f59e0b',
  'Concluído': '#10b981',
};

const categories = [...new Set(demands.map((d) => d.category))];

function HeatLayer({ points, visible }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!visible || points.length === 0) return;
    layerRef.current = L.heatLayer(
      points.map((p) => [p.lat, p.lng, p.priority === 'Crítica' ? 1 : p.priority === 'Alta' ? 0.7 : 0.4]),
      { radius: 35, blur: 25, maxZoom: 17, gradient: { 0.2: '#0051d5', 0.5: '#f59e0b', 0.8: '#dc2626' } }
    ).addTo(map);
    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [points, visible, map]);

  return null;
}

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function Radar() {
  const [filterDistrict, setFilterDistrict] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [showHeat, setShowHeat] = useState(true);
  const [showPins, setShowPins] = useState(true);

  const filtered = useMemo(
    () =>
      demands.filter(
        (d) =>
          (filterDistrict === 'Todos' || d.district === filterDistrict) &&
          (filterStatus === 'Todos' || d.status === filterStatus) &&
          (filterCategory === 'Todas' || d.category === filterCategory)
      ),
    [filterDistrict, filterStatus, filterCategory]
  );

  const districts = ['Todos', ...new Set(demands.map((d) => d.district))];
  const statuses = ['Todos', ...Object.keys(statusColors)];

  const counts = {
    total: filtered.length,
    critico: filtered.filter((d) => d.status === 'Crítico').length,
    analise: filtered.filter((d) => d.status === 'Em Análise').length,
    concluido: filtered.filter((d) => d.status === 'Concluído').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-headline-lg text-primary">Observatório — Mapa de Distribuição</h2>
          <p className="text-on-surface-variant">
            Geolocalização em tempo real de demandas e protocolos com camada de calor por densidade.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHeat((v) => !v)}
            className={`px-3 py-2 rounded-lg text-label-sm font-bold flex items-center gap-2 border transition-all ${
              showHeat ? 'bg-secondary text-on-secondary border-secondary' : 'border-outline-variant text-on-surface-variant'
            }`}
          >
            <Icon name="local_fire_department" className="text-base" /> Calor
          </button>
          <button
            onClick={() => setShowPins((v) => !v)}
            className={`px-3 py-2 rounded-lg text-label-sm font-bold flex items-center gap-2 border transition-all ${
              showPins ? 'bg-secondary text-on-secondary border-secondary' : 'border-outline-variant text-on-surface-variant'
            }`}
          >
            <Icon name="location_on" className="text-base" /> Pins
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter-md">
        <Stat label="DEMANDAS FILTRADAS" value={counts.total.toLocaleString('pt-BR')} icon="filter_alt" tone="bg-secondary/10 text-secondary" />
        <Stat label="CRÍTICAS" value={counts.critico} icon="priority_high" tone="bg-error/10 text-error" />
        <Stat label="EM ANÁLISE" value={counts.analise} icon="hourglass_top" tone="bg-amber-100 text-amber-700" />
        <Stat label="CONCLUÍDAS" value={counts.concluido} icon="check_circle" tone="bg-emerald-100 text-emerald-700" />
      </div>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Filtros */}
        <aside className="col-span-12 lg:col-span-3 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 shadow-sm h-fit">
          <h3 className="font-bold text-on-surface flex items-center gap-2 mb-4">
            <Icon name="tune" className="text-secondary text-base" /> Filtros de Camada
          </h3>

          <Field label="REGIÃO / BAIRRO">
            <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md outline-none focus:border-secondary">
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="STATUS">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md outline-none focus:border-secondary">
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="CATEGORIA">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md outline-none focus:border-secondary">
              <option>Todas</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <button className="w-full mt-2 bg-primary text-on-primary py-2.5 rounded-lg text-label-sm font-bold flex items-center justify-center gap-2 hover:opacity-90">
            <Icon name="refresh" className="text-base" /> Atualizar Visualização
          </button>

          <div className="mt-5 pt-4 border-t border-outline-variant/40">
            <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">LEGENDA</p>
            {Object.entries(statusColors).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2 text-xs py-1">
                <span className="w-3 h-3 rounded-full border-2 border-white shadow" style={{ backgroundColor: color }} />
                <span className="text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Mapa */}
        <div className="col-span-12 lg:col-span-9 rounded-2xl overflow-hidden border border-outline-variant/40 shadow-sm bg-surface-container">
          <MapContainer
            center={[-19.9317, -44.0536]}
            zoom={13}
            scrollWheelZoom
            style={{ height: '620px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <HeatLayer points={filtered} visible={showHeat} />
            {showPins &&
              filtered.map((d) => (
                <Marker key={d.id} position={[d.lat, d.lng]} icon={makeIcon(statusColors[d.status])}>
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold text-primary">{d.title}</p>
                      <p className="text-on-surface-variant">{d.district} • {d.category}</p>
                      <p className="font-mono mt-1">#{d.id}</p>
                      <span
                        className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: statusColors[d.status] }}
                      >
                        {d.status}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, tone }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 shadow-sm flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl ${tone} flex items-center justify-center`}>
        <Icon name={icon} />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label}</p>
        <p className="text-headline-lg text-primary leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-bold tracking-wider text-on-surface-variant mb-1">{label}</label>
      {children}
    </div>
  );
}
