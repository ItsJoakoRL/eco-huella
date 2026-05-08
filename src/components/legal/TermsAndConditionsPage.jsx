import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ecoHuellaLogo from "../../assets/eco-huella-logo-generated.png";

const sections = [
  {
    title: "1. Identificacion del servicio",
    body:
      "EcoHuella es una plataforma web orientada a estimar, organizar y visualizar informacion vinculada con habitos de consumo, impacto ambiental y acciones sugeridas de mejora. La informacion brindada por la plataforma tiene finalidad educativa, orientativa y de gestion interna, y no constituye asesoramiento legal, tecnico, ambiental, medico, financiero ni profesional certificado.",
  },
  {
    title: "2. Aceptacion de los terminos",
    body:
      "Al crear una cuenta, iniciar sesion, cargar datos o utilizar cualquier funcionalidad de EcoHuella, la persona usuaria declara haber leido, comprendido y aceptado estos Terminos y Condiciones. Si no acepta estas condiciones, no podra acceder a las funcionalidades internas de la plataforma.",
  },
  {
    title: "3. Registro, cuenta y veracidad de los datos",
    body:
      "La persona usuaria se compromete a proporcionar informacion verdadera, actualizada y suficiente para el uso correcto de la plataforma. Cada cuenta es personal e intransferible. La persona usuaria es responsable por la confidencialidad de sus credenciales, por toda actividad realizada desde su cuenta y por notificar cualquier uso no autorizado.",
  },
  {
    title: "4. Uso permitido",
    body:
      "EcoHuella debe utilizarse de forma licita, respetuosa y acorde con su finalidad. Queda prohibido usar la plataforma para cargar informacion falsa de manera deliberada, vulnerar sistemas, extraer datos sin autorizacion, interferir con el servicio, suplantar identidades o realizar actividades contrarias a la ley, la moral, la buena fe o derechos de terceros.",
  },
  {
    title: "5. Datos personales y privacidad",
    body:
      "EcoHuella puede tratar datos de identificacion, contacto, perfil, ubicacion general, composicion del hogar, ocupacion, respuestas ambientales y resultados asociados al diagnostico. Estos datos se utilizan para crear y administrar cuentas, autenticar usuarios, personalizar diagnosticos, calcular resultados, mejorar la experiencia y mantener la seguridad del sistema. La plataforma procurara aplicar medidas razonables de seguridad, confidencialidad e integridad de la informacion.",
  },
  {
    title: "6. Resultados, estimaciones y limitaciones",
    body:
      "Los calculos, resultados, metricas, recomendaciones y tableros generados por EcoHuella son estimaciones basadas en datos ingresados por la persona usuaria, parametros disponibles y criterios internos de calculo. Pueden existir diferencias con mediciones reales, auditorias tecnicas o evaluaciones profesionales. La persona usuaria acepta utilizar los resultados como referencia orientativa.",
  },
  {
    title: "7. Propiedad intelectual",
    body:
      "El diseño, codigo, estructura, textos, interfaces, marcas, nombres, iconos, bases de datos, contenidos y demas elementos de EcoHuella pertenecen a sus titulares o se utilizan con autorizacion/licencia correspondiente. No se concede ningun derecho de propiedad intelectual salvo el uso limitado, revocable y no exclusivo necesario para acceder a la plataforma.",
  },
  {
    title: "8. Responsabilidad de la persona usuaria",
    body:
      "La persona usuaria responde por la informacion que carga, por el uso que haga de la plataforma y por las consecuencias derivadas de decisiones adoptadas en base a los resultados. EcoHuella no sera responsable por errores ocasionados por datos incompletos, inexactos, desactualizados o cargados indebidamente.",
  },
  {
    title: "9. Disponibilidad y modificaciones",
    body:
      "EcoHuella podra modificar, suspender, actualizar o discontinuar total o parcialmente sus funcionalidades por mantenimiento, mejoras, razones tecnicas, seguridad o cambios del proyecto. La plataforma no garantiza disponibilidad ininterrumpida ni ausencia absoluta de errores, aunque procurara mantener un funcionamiento razonable.",
  },
  {
    title: "10. Administracion y moderacion",
    body:
      "Las cuentas con permisos administrativos podran gestionar usuarios, preguntas, parametros y resultados conforme a los alcances del sistema. EcoHuella podra suspender, restringir o eliminar cuentas ante incumplimientos, usos abusivos, riesgos de seguridad o requerimientos legales.",
  },
  {
    title: "11. Conservacion y eliminacion de informacion",
    body:
      "La informacion podra conservarse mientras sea necesaria para el funcionamiento de la cuenta, fines academicos, administrativos, estadisticos, de seguridad o cumplimiento legal. Cuando corresponda, la persona usuaria podra solicitar actualizacion, rectificacion o eliminacion de datos, sujeto a limitaciones tecnicas, legales o de respaldo.",
  },
  {
    title: "12. Cambios en estos terminos",
    body:
      "EcoHuella podra actualizar estos Terminos y Condiciones. Cuando los cambios sean relevantes, se podra requerir una nueva aceptacion para continuar utilizando la plataforma. El uso posterior a la actualizacion implica aceptacion de la version vigente.",
  },
  {
    title: "13. Contacto",
    body:
      "Para consultas, solicitudes o reclamos vinculados con la plataforma, privacidad, acceso o eliminacion de datos, la persona usuaria podra comunicarse con el equipo responsable de EcoHuella por los canales institucionales disponibles.",
  },
];

const TermsAndConditionsPage = () => {
  const { isAuthenticated, termsPending, acceptTerms, rejectTerms } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!termsPending) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAccept = () => {
    acceptTerms();
    navigate("/dashboard", { replace: true });
  };

  const handleReject = () => {
    rejectTerms();
    navigate("/login", { replace: true });
  };

  return (
    <main className="terms-page">
      <header className="terms-brand">
        <Link to="/login" className="terms-brand-mark" aria-label="EcoHuella">
          <img src={ecoHuellaLogo} alt="" className="terms-brand-logo" />
        </Link>
      </header>

      <section className="terms-card animate-rise">
        <div className="terms-hero">
          <span className="terms-eyebrow">Uso responsable de EcoHuella</span>
          <h1>Terminos y Condiciones</h1>
          <p>
            Antes de acceder a la plataforma, revisa y acepta las condiciones
            aplicables al uso del servicio, tratamiento de datos y alcance de
            los resultados ambientales.
          </p>
        </div>

        <div className="terms-scroll" tabIndex="0">
          <p className="terms-date">
            Ultima actualizacion: 6 de mayo de 2026
          </p>
          {sections.map((section) => (
            <article key={section.title} className="terms-section">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>

        <div className="terms-actions">
          <button type="button" className="terms-reject" onClick={handleReject}>
            No acepto
          </button>
          <button type="button" className="terms-accept" onClick={handleAccept}>
            Acepto los terminos
          </button>
        </div>
      </section>
    </main>
  );
};

export default TermsAndConditionsPage;
