import crest from "../../assets/uccuyo-escudo.png";

const UNIVERSITY = "Universidad Católica de Cuyo";

// Escudo + nombre de la universidad. Va dentro de la app (cabecera, pie, portada y
// pantallas de acceso); el ícono de la app no cambia.
const variants = {
  header: { caption: "San Juan · Argentina" },
  inline: { caption: "San Juan · Argentina" },
  footer: { caption: "Proyecto académico de Ética" },
  aside: { caption: "Proyecto de Ética · San Juan" },
};

export default function UniversityBadge({ variant = "header", className = "" }) {
  if (variant === "pill") {
    return (
      <span className={`hero-pill ${className}`.trim()}>
        <img src={crest} alt="Escudo de la Universidad Católica de Cuyo" />
        Proyecto de Ética · UCCuyo
      </span>
    );
  }

  const { caption } = variants[variant] || variants.header;

  return (
    <div className={`uni-badge uni-badge-${variant} ${className}`.trim()}>
      <img
        src={crest}
        alt="Escudo de la Universidad Católica de Cuyo"
        className="uni-badge-crest"
        width="44"
        height="44"
      />
      <span className="uni-badge-text">
        <strong>{UNIVERSITY}</strong>
        <small>{caption}</small>
      </span>
    </div>
  );
}
