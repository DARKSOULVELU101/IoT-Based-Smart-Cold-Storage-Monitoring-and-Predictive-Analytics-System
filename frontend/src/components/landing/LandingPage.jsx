import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
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

function useTilt(ref, intensity = 15) {
  const [style, setStyle] = useState({ rotateX: 0, rotateY: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handle = (e) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      setStyle({
        rotateY: ((x - centerX) / centerX) * intensity,
        rotateX: -((y - centerY) / centerY) * intensity,
      })
    }
    const reset = () => setStyle({ rotateX: 0, rotateY: 0 })
    el.addEventListener('mousemove', handle)
    el.addEventListener('mouseleave', reset)
    return () => { el.removeEventListener('mousemove', handle); el.removeEventListener('mouseleave', reset) }
  }, [ref, intensity])
  return style
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899, #F59E0B)',
      }}
    />
  )
}

function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const handleMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const xDist = e.clientX - rect.left - rect.width / 2
    const yDist = e.clientY - rect.top - rect.height / 2
    x.set(xDist * 0.3)
    y.set(yDist * 0.3)
  }, [x, y])

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

function TiltCard({ children, className, ...props }) {
  const ref = useRef(null)
  const tilt = useTilt(ref, 12)
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ perspective: 800, transformStyle: 'preserve-3d' }}
      {...props}
    >
      <motion.div
        animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function AnimatedCounter({ target, duration = 2, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const springVal = useMotionValue(0)
  const spring = useSpring(springVal, { stiffness: 50, damping: 20 })

  useEffect(() => {
    if (!inView) return
    springVal.set(target)
    const unsub = spring.on('change', (v) => setCount(Math.round(v)))
    return unsub
  }, [inView, target, springVal, spring])

  const formatted = target >= 1000 ? count.toLocaleString() : count
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>
}

function FloatingBlob({ className, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full opacity-[0.07] blur-3xl ${className}`}
      animate={{
        x: [0, 40, -30, 20, 0],
        y: [0, -40, 30, -20, 0],
        scale: [1, 1.15, 0.85, 1.1, 1],
        rotate: [0, 10, -10, 5, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

function SectionReveal({ children, className, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerContainer({ children, className, stagger = 0.08 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
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
      className="absolute glass-card rounded-2xl p-3 shadow-lg shadow-primary-500/10"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
      transition={{
        opacity: { delay: delay + 0.5, duration: 0.5 },
        scale: { delay: delay + 0.5, type: 'spring', stiffness: 200 },
        y: { duration: 6, repeat: Infinity, delay, ease: 'easeInOut' },
        rotate: { duration: 8, repeat: Infinity, delay: delay + 1, ease: 'easeInOut' },
      }}
    >
      <Icon className="w-6 h-6 text-primary-500" />
    </motion.div>
  )
}

function ParticleField() {
  const particles = useRef(
    Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
    }))
  ).current

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary-400/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function GlowingOrb({ className, color = 'primary' }) {
  const colors = {
    primary: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    secondary: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    accent: 'from-pink-500/20 via-rose-500/10 to-transparent',
  }
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      style={{ background: `radial-gradient(circle, ${color === 'primary' ? 'rgba(99,102,241,0.15)' : color === 'secondary' ? 'rgba(6,182,212,0.15)' : 'rgba(236,72,153,0.15)'}, transparent)` }}
    />
  )
}

export default function LandingPage() {
  const mouse = useMousePosition()
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.92])
  const parallaxBgY = useTransform(scrollYProgress, [0, 1], [0, -300])
  const mouseFollowerX = useMotionValue(0)
  const mouseFollowerY = useMotionValue(0)
  const mouseFollowerXS = useSpring(mouseFollowerX, { stiffness: 50, damping: 20 })
  const mouseFollowerYS = useSpring(mouseFollowerY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    mouseFollowerX.set((mouse.x / w - 0.5) * 500)
    mouseFollowerY.set((mouse.y / h - 0.5) * 500)
  }, [mouse.x, mouse.y, mouseFollowerX, mouseFollowerY])

  const stats = [
    { label: 'IoT Devices', value: 128, suffix: '+', color: 'from-indigo-500 to-blue-500' },
    { label: 'Data Points Daily', value: 50000, suffix: '+', color: 'from-purple-500 to-pink-500' },
    { label: 'Uptime', value: 99.9, suffix: '%', decimals: 1, color: 'from-emerald-500 to-teal-500' },
    { label: 'Alerts Resolved', value: 2400, suffix: '+', color: 'from-amber-500 to-orange-500' },
  ]

  const features = [
    { icon: Monitor, title: 'Real-Time Monitoring', desc: 'Track temperature, humidity, power, and air quality across all connected devices with sub-second latency.', gradient: 'from-blue-500 to-indigo-600' },
    { icon: TrendingUp, title: 'Predictive Analytics', desc: 'AI-powered trend analysis and 7-day forecasting to prevent equipment failures before they happen.', gradient: 'from-purple-500 to-pink-600' },
    { icon: AlertTriangle, title: 'Smart Alerts', desc: 'Configurable threshold-based alerts with severity levels, automatic escalation, and real-time notifications.', gradient: 'from-amber-500 to-orange-600' },
    { icon: Database, title: 'Data Pipeline', desc: 'Secure REST API ingestion from ESP32 devices to PostgreSQL with full analytics engine processing.', gradient: 'from-emerald-500 to-teal-600' },
    { icon: BarChart3, title: 'Advanced Dashboards', desc: 'Interactive charts, heatmaps, and gauges built with Recharts for comprehensive data visualization.', gradient: 'from-rose-500 to-red-600' },
    { icon: Shield, title: 'Enterprise Security', desc: 'JWT authentication, role-based access control, and encrypted data transmission across all endpoints.', gradient: 'from-cyan-500 to-blue-600' },
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
    { icon: Radio, label: 'Sensor Devices', desc: 'Temperature, Humidity, Gas, pH, Vibration' },
    { icon: Cpu, label: 'ESP32 MCU', desc: 'Data Collection & Transmission' },
    { icon: Cloud, label: 'Wokwi Cloud', desc: 'IoT Simulation Platform' },
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
      <ScrollProgress />

      <motion.div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          x: mouseFollowerXS,
          y: mouseFollowerYS,
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glass-panel"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">IoT Suite</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              Dashboard
            </Link>
            <MagneticButton className="gradient-bg text-white text-sm font-medium px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-shadow cursor-pointer border-0">
              <Link to="/dashboard" className="flex items-center gap-1">
                Launch App <Zap className="w-3.5 h-3.5" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <motion.div style={{ y: parallaxBgY }} className="absolute inset-0">
          <FloatingBlob className="w-[700px] h-[700px] bg-indigo-500 -top-40 -left-40" delay={0} />
          <FloatingBlob className="w-[600px] h-[600px] bg-purple-500 -bottom-20 -right-40" delay={5} />
          <FloatingBlob className="w-[500px] h-[500px] bg-cyan-500 top-1/3 right-1/4" delay={10} />
          <GlowingOrb className="w-96 h-96 top-20 left-1/4" color="primary" />
          <GlowingOrb className="w-72 h-72 bottom-32 right-1/3" color="secondary" />
          <GlowingOrb className="w-64 h-64 top-1/3 right-10" color="accent" />
        </motion.div>

        <ParticleField />

        {deviceIcons.map((Icon, i) => (
          <FloatingDeviceIcon key={i} icon={Icon} delay={i * 0.8} x={8 + (i % 3) * 38} y={12 + Math.floor(i / 3) * 58} />
        ))}

        <motion.div
          className="relative z-10 text-center max-w-5xl mx-auto px-6"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-gray-600">Live IoT Monitoring Active</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-gray-900 leading-[0.92] tracking-tight mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              Industrial IoT
              <br />
              <motion.span
                className="gradient-text relative inline-block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Analytics Suite
                <motion.span
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-4 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Real-Time Monitoring, Predictive Analytics and Smart Device Management
            </motion.p>

            <motion.p
              className="text-sm text-gray-400 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Created by{' '}
              <span className="font-bold gradient-text text-base">NARENDRAMEL</span>
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, type: 'spring', stiffness: 100 }}
            >
              <MagneticButton className="gradient-bg text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 transition-shadow flex items-center gap-2 cursor-pointer border-0">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Launch Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
              <MagneticButton className="glass-card px-8 py-3.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-white/80 transition-colors flex items-center gap-2 cursor-pointer border-0">
                <a href="#about" className="flex items-center gap-2">
                  View Analytics <BarChart3 className="w-4 h-4" />
                </a>
              </MagneticButton>
              <MagneticButton className="glass-card px-6 py-3.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-white/80 transition-colors flex items-center gap-2 cursor-pointer border-0">
                <a href="https://github.com/DARKSOULVELU101/IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              </MagneticButton>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <a href="#about" className="inline-flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors group">
              <span className="text-xs mb-2 group-hover:text-gray-500 transition-colors">Scroll to explore</span>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6" stagger={0.1}>
            {stats.map((stat, i) => (
              <StaggerItem key={i}>
                <TiltCard className="w-full">
                  <motion.div
                    className="glass-card rounded-2xl p-6 text-center relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
                    <div className="relative">
                      <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  </motion.div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
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
              An autonomous platform for testing and integrating IoT devices with a professional
              analytics dashboard. Bridging embedded sensor networks and enterprise-grade data visualization.
            </p>
          </SectionReveal>

          <StaggerContainer className="grid md:grid-cols-3 gap-6" stagger={0.12}>
            {[
              { icon: Cpu, title: 'Cold Storage Monitoring', desc: 'Real-time temperature and humidity tracking for cold chain logistics and food safety compliance.' },
              { icon: Activity, title: 'Machine Health Monitoring', desc: 'Vibration analysis and predictive maintenance for industrial machinery and equipment.' },
              { icon: Droplets, title: 'Water Quality Monitoring', desc: 'pH, turbidity, and TDS monitoring for water treatment and environmental compliance.' },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <TiltCard className="w-full h-full">
                  <GlassCard className="h-full group">
                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-shadow">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </GlassCard>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
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

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.08}>
            {features.map((feature, i) => (
              <StaggerItem key={i}>
                <TiltCard className="w-full h-full">
                  <motion.div
                    className="glass-card rounded-2xl p-8 h-full group relative overflow-hidden cursor-pointer"
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.06] rounded-full -mr-10 -mt-10 transition-opacity duration-500`} />
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
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
            <motion.div
              className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden"
              whileHover={{ scale: 1.005 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <GlowingOrb className="w-64 h-64 -top-20 -right-20" color="primary" />

              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" stagger={0.1}>
                {[
                  { label: 'Active Devices', value: '12', icon: Cpu, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Temperature', value: '4.2°C', icon: Thermometer, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Humidity', value: '62%', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50' },
                  { label: 'Health Score', value: '94%', icon: Activity, color: 'text-primary-500', bg: 'bg-primary-50' },
                ].map((item, i) => (
                  <StaggerItem key={i}>
                    <div className="bg-white/80 rounded-xl p-4 border border-gray-100 group hover:border-primary-200 transition-colors">
                      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <div className="bg-white/60 rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-medium text-gray-500">Live Telemetry Stream</span>
                </div>
                <div className="h-44 flex items-end gap-[2px]">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        background: `linear-gradient(to top, rgba(99,102,241,${0.3 + Math.random() * 0.4}), rgba(6,182,212,${0.3 + Math.random() * 0.4}))`,
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${15 + Math.random() * 85}%` }}
                      transition={{ delay: i * 0.015, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      viewport={{ once: true }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
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
                    className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 w-32 h-32 justify-center group cursor-pointer relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.6, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.08 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                    <step.icon className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform relative z-10" />
                    <div className="text-xs font-bold text-gray-900 text-center relative z-10">{step.label}</div>
                    <div className="text-[10px] text-gray-400 text-center relative z-10 hidden md:block">{step.desc}</div>
                  </motion.div>
                  {i < architectureSteps.length - 1 && (
                    <motion.div
                      className="hidden md:block"
                      initial={{ opacity: 0, scaleX: 0 }}
                      whileInView={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: i * 0.1 + 0.05, duration: 0.4 }}
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

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" stagger={0.06}>
            {sensors.map((sensor, i) => (
              <StaggerItem key={i}>
                <TiltCard className="w-full">
                  <motion.div
                    className="glass-card rounded-2xl p-5 text-center group cursor-pointer"
                    whileHover={{ y: -6, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <sensor.icon className="w-8 h-8 text-primary-500 mx-auto mb-3 group-hover:scale-125 group-hover:text-secondary-500 transition-all duration-300" />
                    <div className="text-sm font-bold text-gray-900 mb-1">{sensor.name}</div>
                    <div className="text-xs text-gray-400">{sensor.type}</div>
                  </motion.div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
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

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" stagger={0.05}>
            {techStack.map((tech, i) => (
              <StaggerItem key={i}>
                <TiltCard className="w-full">
                  <motion.div
                    className="glass-card rounded-2xl p-6 group cursor-pointer relative overflow-hidden"
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className={`absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br ${tech.color} rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                      <span className="text-white text-sm font-bold">{tech.name[0]}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-900 mb-0.5">{tech.name}</div>
                    <div className="text-xs text-gray-400">{tech.desc}</div>
                  </motion.div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
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
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <TiltCard className="w-full" intensity={8}>
              <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
                <GlowingOrb className="w-40 h-40 -top-10 -right-10" color="primary" />
                <div className="h-64 flex items-end gap-1 mb-4">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        background: i > 28
                          ? `linear-gradient(to top, rgba(236,72,153,${0.4 + Math.random() * 0.3}), rgba(139,92,246,${0.4 + Math.random() * 0.3}))`
                          : `linear-gradient(to top, rgba(99,102,241,${0.3 + Math.random() * 0.4}), rgba(6,182,212,${0.3 + Math.random() * 0.4}))`,
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${25 + Math.sin(i * 0.3) * 30 + Math.random() * 20}%` }}
                      transition={{ delay: i * 0.025, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      viewport={{ once: true }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-primary-500 to-secondary-400" />
                    <span>Historical Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-pink-500 to-purple-400" />
                    <span>7-Day Forecast</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-transparent via-accent-50/20 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionReveal>
            <GlowingOrb className="w-80 h-80 mx-auto" color="primary" />
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 relative z-10">
              Ready to <span className="gradient-text">Monitor Smarter</span>?
            </h2>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto relative z-10">
              Deploy your IoT monitoring platform with enterprise-grade reliability.
              Connect ESP32 devices, visualize real-time data, and make data-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <MagneticButton className="gradient-bg text-white px-10 py-4 rounded-xl font-semibold shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 transition-shadow flex items-center gap-2 text-lg cursor-pointer border-0">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Launch Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              </MagneticButton>
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
              {navItems.map(item => (
                <a key={item.label} href={item.href} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">{item.label}</a>
              ))}
              <a href="https://github.com/DARKSOULVELU101/IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
            <div className="text-xs text-gray-400">
              &copy; 2026 NARENDRAMEL. Industrial IoT Analytics Suite.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
