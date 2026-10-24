import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UniversityBadge from "../ui/UniversityBadge";
import crest from "../../assets/uccuyo-escudo.png";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Número que sube hasta su valor al aparecer (sin animar si la persona lo pidió así).
function CountUp({ to, duration = 1200 }) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? to : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, duration]);

  return <>{value}</>;
}

const methodItems = [
  { icon: "home", title: "Hogar", desc: "Consumo eléctrico, térmico y eficiencia energética." },
  { icon: "water_drop", title: "Agua", desc: "Hábitos semanales de lavado, riego y cuidado doméstico." },
  { icon: "commute", title: "Movilidad", desc: "Desplazamientos diarios y viajes anuales." },
  { icon: "restaurant", title: "Alimentación", desc: "Costo oculto de tu dieta y procedencia." },
  { icon: "recycling", title: "Residuos", desc: "Gestión de desechos y economía circular." },
];

const faqs = [
  {
    q: "¿Qué hacen con mis datos?",
    a: "Usamos tus respuestas para calcular tu huella y mostrarte recomendaciones. Se guardan asociadas a tu cuenta y solo las ves vos y los administradores del proyecto. No se venden ni se ceden con fines comerciales, y podés pedir que se eliminen. Todo el detalle está en los Términos y Condiciones.",
  },
  {
    q: "¿De dónde salen los cálculos?",
    a: "El modelo combina parámetros de consumo y factores de emisión para convertir tus hábitos en toneladas de CO₂ equivalente. Son estimaciones orientativas, no una auditoría ambiental.",
  },
  {
    q: "Mi huella es muy alta, ¿debo preocuparme?",
    a: "No buscamos culpa, sino claridad. El diagnóstico te muestra dónde conviene actuar primero para reducir impacto sin cambiar todo de golpe.",
  },
];

export default function LandingPage({ onStart }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (onStart) {
      onStart();
      return;
    }

    // La portada es pública: quien no tiene cuenta empieza registrándose.
    navigate(isAuthenticated ? "/encuestas" : "/signup");
  };

  const ctaLabel = isAuthenticated ? "Comenzar cuestionario" : "Crear mi cuenta y empezar";

  return (
    <div className="landing-page">
      <section className="eco-aurora landing-section hero-section">
        <div className="landing-container hero-grid">
          <div className="hero-copy animate-rise">
            <div className="hero-eyebrow-row">
              <UniversityBadge variant="pill" />
            </div>
            <h1 className="hero-title">
              Reduce tu huella, <br />
              <em>sana el planeta.</em>
            </h1>
            <p>
              Mide tu impacto ambiental con precisión científica y descubre acciones
              personalizadas para regenerar el ecosistema que compartimos.
            </p>
            <div className="hero-actions">
              <button onClick={handleStart} className="hero-cta eco-glow-button">
                {ctaLabel}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            {!isAuthenticated && (
              <p className="hero-login-hint">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
              </p>
            )}
          </div>

          <div className="impact-stage animate-pop" style={{ animationDelay: "140ms" }}>
            <div className="impact-meter">
              <span className="impact-meter-kicker">Huella anual por persona</span>
              <h3>¿Cómo se compara tu huella?</h3>

              <div className="meter-row">
                <div className="meter-label">
                  <span>Objetivo sostenible</span>
                  <strong>1,5 t</strong>
                </div>
                <div className="meter-track">
                  <div className="meter-fill goal" />
                </div>
              </div>

              <div className="meter-row">
                <div className="meter-label">
                  <span>Media de referencia</span>
                  <strong>4,7 t</strong>
                </div>
                <div className="meter-track">
                  <div className="meter-fill avg" />
                </div>
              </div>

              <div className="meter-row">
                <div className="meter-label">
                  <span>Tu huella</span>
                  <strong>? t</strong>
                </div>
                <div className="meter-track">
                  <div className="meter-fill you" />
                </div>
              </div>

              <p className="meter-note">
                Descúbrelo en solo 3 minutos y mira qué parte de tu vida pesa más.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label="EcoHuella en números">
        <div className="landing-container stats-grid">
          <div className="stat-item">
            <strong>
              <CountUp to={3} />
            </strong>
            <span>Recorridos</span>
          </div>
          <div className="stat-item">
            <strong>
              <CountUp to={5} />
            </strong>
            <span>Categorías de impacto</span>
          </div>
          <div className="stat-item">
            <strong>
              <CountUp to={3} />
              <small> min</small>
            </strong>
            <span>Para tu diagnóstico</span>
          </div>
        </div>
      </section>

      <section className="landing-section bg-surface-container-low">
        <div className="landing-container">
          <div className="section-kicker animate-rise">
            <h2>Tu viaje hacia la sostenibilidad</h2>
            <p>
              Una experiencia clara para transformar datos complejos en decisiones
              concretas y cambios reales.
            </p>
          </div>

          <div className="bento-grid">
            <article className="bento-card large hover-lift animate-rise">
              <span className="bento-stat">1,5 t</span>
              <div>
                <h3>El límite sostenible</h3>
                <p>
                  Es el objetivo anual por persona para mantener el equilibrio ecológico.
                  Hoy, el promedio global supera las 4 toneladas.
                </p>
              </div>
            </article>

            <article className="bento-card dark hover-lift animate-rise" style={{ animationDelay: "120ms" }}>
              <h3>¿Qué es el CO₂e?</h3>
              <p>
                Calculamos el carbono equivalente: una métrica universal que agrupa
                los gases de efecto invernadero en un solo diagnóstico.
              </p>
            </article>

            <article className="bento-card wide hover-lift animate-rise" style={{ animationDelay: "220ms" }}>
              <div className="bento-icon">
                <span className="material-symbols-outlined text-4xl">tips_and_updates</span>
              </div>
              <div>
                <h3>Menos culpa. Más acción.</h3>
                <p>
                  No se trata de cambiar tu vida de golpe, sino de entender tu punto de
                  partida para tomar decisiones estratégicas y realistas hoy mismo.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section bg-surface" id="como-funciona">
        <div className="landing-container">
          <div className="section-kicker center animate-rise">
            <h2>Un diagnóstico de 3 minutos.</h2>
            <p>3 recorridos simples para medir ambiente, agua o desayuno.</p>
          </div>

          <div className="method-grid">
            {methodItems.map((item, index) => (
              <article
                key={item.title}
                className="method-card hover-lift animate-pop"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="method-icon animate-float-slow" style={{ animationDelay: `${index * 140}ms` }}>
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <h3 className="mb-2 font-headline text-xl font-bold text-on-surface">{item.title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section uni-section" id="proyecto">
        <div className="landing-container uni-grid">
          <div className="uni-crest-card hover-lift animate-pop">
            <img src={crest} alt="Escudo de la Universidad Católica de Cuyo" />
          </div>

          <div className="uni-copy animate-rise">
            <span className="uni-eyebrow">Proyecto académico</span>
            <h2>Hecho en la Universidad Católica de Cuyo</h2>
            <p>
              EcoHuella es un trabajo de la materia Ética, en San Juan. Propone algo simple:
              que cada persona pueda medir su impacto ambiental y reflexionar sobre la
              responsabilidad que tiene con el entorno que compartimos.
            </p>
            <div className="uni-values">
              <span>
                <span className="material-symbols-outlined">balance</span>
                Ética aplicada
              </span>
              <span>
                <span className="material-symbols-outlined">verified_user</span>
                Datos con consentimiento
              </span>
              <span>
                <span className="material-symbols-outlined">diversity_3</span>
                Pensado para la comunidad
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-surface-container-low">
        <div className="landing-container">
          <h2 className="faq-title animate-rise text-center">Preguntas frecuentes</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details
                key={faq.q}
                className="faq-card hover-lift animate-rise"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <summary>
                  {faq.q}
                  <span className="material-symbols-outlined text-primary transition-transform duration-300">
                    expand_more
                  </span>
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section final-cta">
        <div className="landing-container final-cta-inner">
          <h2>¿Listo para conocer tu huella?</h2>
          <p>Son solo unas preguntas. El resultado es tuyo y te muestra por dónde empezar.</p>
          <button onClick={handleStart} className="hero-cta eco-glow-button">
            {ctaLabel}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
}
