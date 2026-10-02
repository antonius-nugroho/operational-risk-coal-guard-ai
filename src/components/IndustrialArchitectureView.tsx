import React from 'react';
import { 
  Layers, 
  Server, 
  Database, 
  CloudSun, 
  Cpu, 
  Radio, 
  ArrowRight, 
  ShieldCheck, 
  HardDrive,
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';

export const IndustrialArchitectureView: React.FC = () => {
  const gcpServices = [
    {
      name: 'Gemini on Vertex AI',
      badge: 'Reasoning & CRO Copilot',
      icon: Cpu,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      role: 'Interprets probabilistic tail risk, synthesizes telemetry anomalies, and generates natural language engineering mitigation strategies for plant managers.',
      spec: 'gemini-3.6-flash & gemini-3.7-flash multi-model fallback ladder'
    },
    {
      name: 'Vertex AI Model Registry & Endpoints',
      badge: 'Predictive Subsystem Risk',
      icon: Layers,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      role: 'Runs continuous failure probability inference (30-day lookahead) on boiler tube corrosion, mill trips, and blade erosion using custom XGBoost and PyTorch autoencoders.',
      spec: 'Vertex AI Pipeline with Managed Dataset auto-split'
    },
    {
      name: 'BigQuery Data Warehouse',
      badge: 'Analytical Engine',
      icon: Database,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      role: 'Stores billions of 10-second DCS/SCADA tag records, heat rate balance metrics, historical forced outage journals, and coal proximate analyses.',
      spec: 'Time-partitioned by timestamp, clustered by unitId & subsystem'
    },
    {
      name: 'Cloud Pub/Sub',
      badge: 'High-Throughput Ingestion',
      icon: Radio,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      role: 'Receives real-time sensor streams from plant edge gateways (OPC-UA / MQTT) at 100,000 tags/sec with zero message loss.',
      spec: 'Dead-letter topics + exactly-once delivery guarantees'
    },
    {
      name: 'Google Cloud Dataflow',
      badge: 'Stream & Batch Pipelines',
      icon: GitBranch,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      role: 'Applies Apache Beam streaming windowing, outlier filtering, unit conversion (Btu to MJ, Celsius to Kelvin), and joins with coal yard batch telemetry.',
      spec: 'Autoscaling worker pool with streaming engine v2'
    },
    {
      name: 'Google Cloud Storage (GCS)',
      badge: 'Asset & Raw Object Store',
      icon: HardDrive,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      role: 'Houses thermal drone infrared thermography images, acoustic ultrasonic leak recordings, and coal shipment certificate PDFs.',
      spec: 'Standard multi-region bucket with Object Lifecycle Management'
    },
    {
      name: 'Google Cloud Run',
      badge: 'Containerized Application Host',
      icon: Server,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      role: 'Hosts this responsive Full-Stack Operational Risk Engine with auto-scaling (0 to N instances), minimal latency, and zero server maintenance.',
      spec: 'Containerized Node/React environment with Secret Manager integration'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Google Cloud Reference Architecture for Coal Generation Ops</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          End-to-end industrial data topology integrating OT (Operational Technology) DCS systems with Google Cloud Platform's AI & analytical stack.
        </p>
      </div>

      {/* Topology Flowchart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
          Data Flow: From Physical Sensors to Predictive Risk Models
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-[10px] font-mono text-amber-400 uppercase">Stage 1: Plant Floor OT</div>
            <div className="text-sm font-bold text-white">Sensors & DCS</div>
            <p className="text-xs text-slate-400">
              Boiler thermocouples, acoustic leak sensors, turbine vibro-probes, CEMS emission analyzers.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-[10px] font-mono text-blue-400 uppercase">Stage 2: Streaming Buffer</div>
            <div className="text-sm font-bold text-white">Pub/Sub & Dataflow</div>
            <p className="text-xs text-slate-400">
              Low-latency edge push via OPC-UA. Dataflow validates schema, strips noise, and calculates rolling 5-minute averages.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Stage 3: Data Lakehouse</div>
            <div className="text-sm font-bold text-white">BigQuery & Cloud Storage</div>
            <p className="text-xs text-slate-400">
              Petabyte-scale analytical store. Ingests raw telemetry and links each event with historical forced outage logs.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-[10px] font-mono text-purple-400 uppercase">Stage 4: AI & UI Execution</div>
            <div className="text-sm font-bold text-white">Vertex AI & Cloud Run</div>
            <p className="text-xs text-slate-400">
              Vertex AI ML predictions + Gemini reasoning served instantly via Cloud Run to operations directors.
            </p>
          </div>

        </div>
      </div>

      {/* GCP Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gcpServices.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-md hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg border ${svc.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {svc.badge}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{svc.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{svc.role}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                ⚡ {svc.spec}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
