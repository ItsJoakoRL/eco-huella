import { useNavigate } from "react-router-dom";

export default function LandingPage({ onStart }) {
  const navigate = useNavigate();
  const handleStart = () => {
    if (onStart) {
      onStart();
      return;
    }

    navigate("/quiz");
  };

  const methodItems = [
    { icon: "home", title: "Hogar", desc: "Consumo electrico, termico y eficiencia energetica." },
    { icon: "commute", title: "Movilidad", desc: "Desplazamientos diarios y viajes anuales." },
    { icon: "restaurant", title: "Alimentacion", desc: "Costo oculto de tu dieta y procedencia." },
    { icon: "recycling", title: "Residuos", desc: "Gestion de desechos y economia circular." },
  ];

  const faqs = [
    {
      q: "Que hacen con mis datos?",
      a: "Usamos tus respuestas para calcular tu huella y mostrar recomendaciones. En esta version de la app, los datos quedan asociados a tu cuenta local del proyecto.",
    },
    {
      q: "De donde salen los calculos?",
      a: "El modelo combina parametros de consumo y factores de emision para convertir tus habitos en toneladas de CO2 equivalente.",
    },
    {
      q: "Mi huella es muy alta, debo preocuparme?",
      a: "No buscamos culpa, sino claridad. El diagnostico te muestra donde conviene actuar primero para reducir impacto sin cambiar todo de golpe.",
    },
  ];

  return (
    <div className="landing-page">
      <section className="eco-aurora landing-section hero-section">
        <div className="landing-container hero-grid">
          <div className="hero-copy animate-rise">
            <h1 className="hero-title">
              Reduce tu huella, <br />
              <em>sana el planeta.</em>
            </h1>
            <p>
              Mide tu impacto ambiental con precision cientifica y descubre acciones
              personalizadas para regenerar el ecosistema que compartimos.
            </p>
            <button
              onClick={handleStart}
              className="eco-glow-button inline-flex items-center justify-center gap-2 rounded-full bg-tertiary-container px-10 py-5 text-lg font-bold text-on-tertiary-fixed shadow-lg transition-all hover:brightness-105 active:scale-95"
            >
              Comenzar Cuestionario
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="hero-visual hover-lift animate-pop" style={{ animationDelay: "140ms" }}>
            <span className="material-symbols-outlined animate-float-slow">public</span>
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
              <span className="bento-stat">1.5 t</span>
              <div>
                <h3>El Limite Sostenible</h3>
                <p>
                  Es el objetivo anual por persona para mantener el equilibrio ecologico.
                  Hoy, el promedio global supera las 4 toneladas.
                </p>
              </div>
            </article>

            <article className="bento-card dark hover-lift animate-rise" style={{ animationDelay: "120ms" }}>
              <h3>Que es el CO2e?</h3>
              <p>
                Calculamos el carbono equivalente: una metrica universal que agrupa
                los gases de efecto invernadero en un solo diagnostico.
              </p>
            </article>

            <article className="bento-card wide hover-lift animate-rise" style={{ animationDelay: "220ms" }}>
              <div className="bento-icon">
                <span className="material-symbols-outlined text-4xl">tips_and_updates</span>
              </div>
              <div>
                <h3>Menos culpa. Mas accion.</h3>
                <p>
                  No se trata de cambiar tu vida de golpe, sino de entender tu punto de
                  partida para tomar decisiones estrategicas y realistas hoy mismo.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section bg-surface">
        <div className="landing-container">
          <div className="section-kicker center animate-rise">
            <h2>Un diagnostico de 3 minutos.</h2>
            <p>14 preguntas simples basadas en tus habitos diarios.</p>
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

      <section className="landing-section bg-surface-container-low">
        <div className="landing-container">
          <h2 className="faq-title animate-rise text-center">Preguntas Frecuentes</h2>
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
    </div>
  );
}
