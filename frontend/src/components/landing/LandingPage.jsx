import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Cpu, Activity, Droplets, Warehouse, Thermometer, BarChart3, Shield,
  Zap, ArrowRight, Github, FileText, ExternalLink, ChevronDown,
  Wifi, TrendingUp, AlertTriangle, Database, Cloud, Monitor,
  LineChart, PieChart, Gauge, Radio, Server, Globe, Terminal, Wind
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}

function AnimatedCounter({ target, duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

function FloatingBlob({ className, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full opacity-10 blur-3xl ${className}`}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -30, 20, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

function SectionReveal({ children, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const deviceIcons = [Cpu, Activity, Droplets, Warehouse, Thermometer, Wifi]

function FloatingDeviceIcon({ icon: Icon, delay, x, y }) {
  return (
    <motion.div
      className="absolute glass-card rounded-2xl p-3 shadow-lg"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 5, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <Icon className="w-6 h-6 text-primary-500" />
    </motion.div>
  )
}

export default function LandingPage() {
  const mouse = useMousePosition()
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  const stats = [
    { label: 'IoT Devices', value: 128, suffix: '+' },
    { label: 'Data Points Daily', value: 50000, suffix: '+' },
    { label: 'Uptime', value: 99.9, suffix: '%', decimals: 1 },
    { label: 'Alerts Resolved', value: 2400, suffix: '+' },
  ]

  const features = [
    { icon: Monitor, title: 'Real-Time Monitoring', desc: 'Track temperature, humidity, power, and air quality across all connected devices in real-time.' },
    { icon: TrendingUp, title: 'Predictive Analytics', desc: 'AI-powered trend analysis and forecasting to prevent equipment failures before they happen.' },
    { icon: AlertTriangle, title: 'Smart Alerts', desc: 'Configurable threshold-based alerts with severity levels and automatic escalation.' },
    { icon: Database, title: 'Data Pipeline', desc: 'Secure REST API ingestion from ESP32 devices to PostgreSQL with analytics engine.' },
    { icon: BarChart3, title: 'Advanced Dashboards', desc: 'Interactive charts, heatmaps, and gauges with Recharts for comprehensive data visualization.' },
    { icon: Shield, title: 'Enterprise Security', desc: 'JWT authentication, role-based access control, and encrypted data transmission.' },
  ]

  const techStack = [
    { name: 'React', desc: 'Frontend UI', color: 'from-blue-400 to-blue-600' },
    { name: 'Vite', desc: 'Build Tool', color: 'from-violet-400 to-violet-600' },
    { name: 'Tailwind', desc: 'Styling', color: 'from-cyan-400 to-cyan-600' },
    { name: 'Framer Motion', desc: 'Animations', color: 'from-pink-400 to-pink-600' },
    { name: 'FastAPI', desc: 'Backend API', color: 'from-green-400 to-green-600' },
    { name: 'PostgreSQL', desc: 'Database', color: 'from-blue-500 to-indigo-600' },
    { name: 'ESP32', desc: 'Microcontroller', color: 'from-amber-400 to-amber-600' },
    { name: 'Wokwi', desc: 'IoT Simulator', color: 'from-red-400 to-red-600' },
    { name: 'Render', desc: 'Backend Host', color: 'from-purple-400 to-purple-600' },
    { name: 'Vercel', desc: 'Frontend Host', color: 'from-gray-600 to-gray-800' },
    { name: 'Recharts', desc: 'Data Viz', color: 'from-teal-400 to-teal-600' },
    { name: 'OpenPyXL', desc: 'Excel Export', color: 'from-emerald-400 to-emerald-600' },
  ]

  const architectureSteps = [
    { icon: Radio, label: 'Sensor Devices', desc: 'Temperature, Humidity, Gas, pH, Vibration Sensors' },
    { icon: Cpu, label: 'ESP32 MCU', desc: 'Data Collection & Transmission' },
    { icon: Cloud, label: 'Wokwi-GUEST', desc: 'IoT Simulation Platform' },
    { icon: Terminal, label: 'REST API', desc: 'FastAPI Data Ingestion' },
    { icon: Database, label: 'PostgreSQL', desc: 'Persistent Data Storage' },
    { icon: BarChart3, label: 'Analytics Engine', desc: 'Trend Analysis & Prediction' },
    { icon: Monitor, label: 'Dashboard', desc: 'React Real-Time Visualization' },
  ]

  const sensors = [
    { name: 'DHT22', type: 'Temperature & Humidity', icon: Thermometer },
    { name: 'MQ-135', type: 'Air Quality / Gas', icon: Wind },
    { name: 'HC-SR04', type: 'Ultrasonic Distance', icon: Activity },
    { name: 'pH Sensor', type: 'Water Acidity', icon: Droplets },
    { name: 'TDS Sensor', type: 'Water Purity', icon: Droplets },
    { name: 'MPU6050', type: 'Vibration / Accelerometer', icon: Gauge },
  ]

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Technology', href: '#tech' },
    { label: 'About', href: '#about' },
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Mouse follower */}
      <motion.div
        className="fixed w-96 h-96 rounded-full bg-gradient-to-r from-primary-500/10 to-secondary-500/10 blur-3xl pointer-events-none z-0"
        animate={{ x: mouse.x - 192, y: mouse.y - 192 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      />

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glass-panel"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">IoT Suite</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <a key={item.label} href={item.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{item.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              Dashboard
            </Link>
            <Link to="/dashboard" className="gradient-bg text-white text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
              Launch App
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <FloatingBlob className="w-[600px] h-[600px] bg-primary-500 -top-40 -left-40" delay={0} />
        <FloatingBlob className="w-[500px] h-[500px] bg-secondary-500 -bottom-20 -right-40" delay={5} />
        <FloatingBlob className="w-[400px] h-[400px] bg-accent-500 top-1/3 right-1/4" delay={10} />

        {deviceIcons.map((Icon, i) => (
          <FloatingDeviceIcon key={i} icon={Icon} delay={i * 1.5} x={10 + (i % 3) * 35} y={15 + Math.floor(i / 3) * 55} />
        ))}

        <motion.div
          className="relative z-10 text-center max-w-5xl mx-auto px-6"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-600">Live IoT Monitoring Active</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Industrial IoT
              <br />
              <span className="gradient-text">Analytics Suite</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-4 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Real-Time Monitoring, Predictive Analytics and Smart Device Management
            </motion.p>

            <motion.p
              className="text-sm text-gray-400 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Created by <span className="font-bold gradient-text text-base">NARENDRAMEL</span>
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link
                to="/dashboard"
                className="gradient-bg text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all flex items-center gap-2"
              >
                Launch Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#about"
                className="glass-card px-8 py-3.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-white/80 transition-all flex items-center gap-2"
              >
                View Analytics <BarChart3 className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card px-6 py-3.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-white/80 transition-all flex items-center gap-2"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a
                href="#"
                className="glass-card px-6 py-3.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-white/80 transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Docs
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <a href="#about" className="inline-flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors">
              <span className="text-xs mb-2">Scroll to explore</span>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <SectionReveal key={i}>
                <motion.div
                  className="glass-card rounded-2xl p-6 text-center"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
                    <AnimatedCounter target={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative">
        <FloatingBlob className="w-[500px] h-[500px] bg-secondary-500 top-0 left-0" delay={3} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionReveal className="text-center mb-16">
            <motion.span className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-primary-600 mb-4">
              About the Project
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Purpose-Built for <span className="gradient-text">IoT Innovation</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
              This project was created for the purpose of making an autonomous platform for testing
              and integrating IoT devices with a professional analytics dashboard. It bridges the gap
              between embedded sensor networks and enterprise-grade data visualization.
            </p>
          </SectionReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Cpu, title: 'Cold Storage Monitoring', desc: 'Real-time temperature and humidity tracking for cold chain logistics and food safety compliance.' },
              { icon: Activity, title: 'Machine Health Monitoring', desc: 'Vibration analysis and predictive maintenance for industrial machinery and equipment.' },
              { icon: Droplets, title: 'Water Quality Monitoring', desc: 'pH, turbidity, and TDS monitoring for water treatment and environmental compliance.' },
            ].map((item, i) => (
              <SectionReveal key={i}>
                <GlassCard className="h-full">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-transparent via-primary-50/30 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <SectionReveal className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-primary-600 mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Built for <span className="gradient-text">Performance</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Enterprise-grade features designed for industrial IoT deployments
            </p>
          </SectionReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <SectionReveal key={i}>
                <motion.div
                  className="glass-card rounded-2xl p-8 h-full group"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5 group-hover:gradient-bg transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Live Device Monitoring Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionReveal className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-primary-600 mb-4">
              Live Monitoring
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              See Your Devices <span className="gradient-text">In Action</span>
            </h2>
          </SectionReveal>

          <SectionReveal>
            <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full -mr-20 -mt-20" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Active Devices', value: '12', icon: Cpu, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Temperature', value: '4.2°C', icon: Thermometer, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Humidity', value: '62%', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50' },
                  { label: 'Health Score', value: '94%', icon: Activity, color: 'text-primary-500', bg: 'bg-primary-50' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/80 rounded-xl p-4 border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                    <div className="text-lg font-bold text-gray-900">{item.value}</div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/60 rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-gray-500">Live Telemetry Stream</span>
                </div>
                <div className="h-40 flex items-end gap-1">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        background: `linear-gradient(to top, #4F46E5, #06B6D4)`,
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${20 + Math.random() * 80}%` }}
                      transition={{ delay: i * 0.02, duration: 0.6 }}
                      viewport={{ once: true }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* IoT Architecture Section */}
      <section id="architecture" className="py-24 bg-gradient-to-b from-transparent via-secondary-50/30 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <SectionReveal className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-secondary-600 mb-4">
              Architecture
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              End-to-End <span className="gradient-text">IoT Pipeline</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From sensor data collection to dashboard visualization
            </p>
          </SectionReveal>

          <SectionReveal>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {architectureSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 md:flex-col md:gap-2">
                  <motion.div
                    className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 w-32 h-32 justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4, scale: 1.05 }}
                  >
                    <step.icon className="w-8 h-8 text-primary-500" />
                    <div className="text-xs font-bold text-gray-900 text-center">{step.label}</div>
                  </motion.div>
                  {i < architectureSteps.length - 1 && (
                    <motion.div
                      className="hidden md:block"
                      initial={{ opacity: 0, scaleX: 0 }}
                      whileInView={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: i * 0.1 + 0.05 }}
                      viewport={{ once: true }}
                    >
                      <ArrowRight className="w-6 h-6 text-primary-300 rotate-90 md:rotate-0" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Supported Sensors */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionReveal className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-primary-600 mb-4">
              Hardware
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Supported <span className="gradient-text">Sensors</span>
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sensors.map((sensor, i) => (
              <SectionReveal key={i}>
                <motion.div
                  className="glass-card rounded-2xl p-5 text-center group"
                  whileHover={{ y: -4 }}
                >
                  <sensor.icon className="w-8 h-8 text-primary-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-gray-900 mb-1">{sensor.name}</div>
                  <div className="text-xs text-gray-400">{sensor.type}</div>
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech" className="py-24 bg-gradient-to-b from-transparent via-primary-50/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <SectionReveal className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-primary-600 mb-4">
              Technology Stack
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Modern <span className="gradient-text">Tech Stack</span>
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <SectionReveal key={i}>
                <motion.div
                  className="glass-card rounded-2xl p-6 group"
                  whileHover={{ y: -4 }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-white text-sm font-bold">{tech.name[0]}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-0.5">{tech.name}</div>
                  <div className="text-xs text-gray-400">{tech.desc}</div>
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Predictive Analytics Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionReveal className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-primary-600 mb-4">
                Predictive Analytics
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-6">
                Anticipate Issues <span className="gradient-text">Before They Happen</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Our analytics engine continuously processes telemetry data to identify trends,
                predict potential failures, and recommend maintenance schedules. Stay ahead
                of equipment failures with data-driven insights.
              </p>
              <div className="space-y-4">
                {[
                  'Linear trend extrapolation for temperature forecasting',
                  'Health score degradation prediction',
                  'Anomaly detection across all sensor channels',
                  'Risk assessment with configurable thresholds',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-3xl p-6">
              <div className="h-64 flex items-end gap-1 mb-4">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-primary-500 to-secondary-400"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${30 + Math.sin(i * 0.3) * 30 + Math.random() * 20}%` }}
                    transition={{ delay: i * 0.03, duration: 0.5 }}
                    viewport={{ once: true }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-primary-500 to-secondary-400" />
                <span>Predicted trend with confidence interval</span>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Dashboard Screenshots / CTA */}
      <section className="py-24 bg-gradient-to-b from-transparent via-accent-50/20 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionReveal>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Ready to <span className="gradient-text">Monitor Smarter</span>?
            </h2>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Deploy your IoT monitoring platform with enterprise-grade reliability.
              Connect ESP32 devices, visualize real-time data, and make data-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="gradient-bg text-white px-10 py-4 rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all flex items-center gap-2 text-lg"
              >
                Launch Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">IoT Analytics Suite</div>
                <div className="text-xs text-gray-400">Built by <span className="font-bold gradient-text">NARENDRAMEL</span></div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Features</a>
              <a href="#architecture" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Architecture</a>
              <a href="#tech" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Technology</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
            <div className="text-xs text-gray-400">
              &copy; 2024 NARENDRAMEL. Industrial IoT Analytics Suite.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
