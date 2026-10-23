import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ecoHuellaLogo from "../../assets/eco-huella-logo-generated.png";
import UniversityBadge from "../ui/UniversityBadge";

const sections = [
  {
    title: "1. Identificación del servicio",
    body:
      "EcoHuella es una plataforma web orientada a estimar, organizar y visualizar información vinculada con hábitos de consumo, impacto ambiental y acciones sugeridas de mejora. La información brindada por la plataforma tiene finalidad educativa, orientativa y de gestión interna, y no constituye asesoramiento legal, técnico, ambiental, médico, financiero ni profesional certificado.",
  },
  {
    title: "2. Aceptación de los términos",
    body:
      "Al crear una cuenta, iniciar sesión, cargar datos o utilizar cualquier funcionalidad de EcoHuella, la persona usuaria declara haber leído, comprendido y aceptado estos Términos y Condiciones. Si no acepta estas condiciones, no podrá acceder a las funcionalidades internas de la plataforma.",
  },
  {
    title: "3. Registro, cuenta y veracidad de los datos",
    body:
      "La persona usuaria se compromete a proporcionar información verdadera, actualizada y suficiente para el uso correcto de la plataforma. Cada cuenta es personal e intransferible. La persona usuaria es responsable por la confidencialidad de sus credenciales, por toda actividad realizada desde su cuenta y por notificar cualquier uso no autorizado.",
  },
  {
    title: "4. Uso permitido",
    body:
      "EcoHuella debe utilizarse de forma lícita, respetuosa y acorde con su finalidad. Queda prohibido usar la plataforma para cargar información falsa de manera deliberada, vulnerar sistemas, extraer datos sin autorización, interferir con el servicio, suplantar identidades o realizar actividades contrarias a la ley, la moral, la buena fe o derechos de terceros.",
  },
  {
    title: "5. Datos personales y privacidad",
    body:
      "EcoHuella trata los datos que la propia persona usuaria carga: nombre, nombre de usuario, correo electrónico, contraseña (que se guarda protegida mediante hash, nunca en texto legible), fecha de nacimiento y edad, sexo, ciudad, provincia y país, nivel educativo, ocupación, cantidad de integrantes del hogar, objetivo de sostenibilidad, foto de perfil (opcional), respuestas de las encuestas y los resultados que se calculan a partir de ellas. Se utilizan únicamente para crear y administrar la cuenta, autenticar, calcular y mostrar los resultados, enviar el código de recuperación de contraseña y mantener la seguridad del sistema. No se venden ni se ceden a terceros con fines comerciales. Para funcionar, el servicio se apoya en proveedores de infraestructura (alojamiento del sitio y del servidor, base de datos y envío de correo) que acceden a los datos solo para prestar ese servicio, y las cuentas con rol administrador pueden ver los datos de perfil y los resultados de los usuarios. La plataforma aplica medidas razonables de seguridad, confidencialidad e integridad de la información. Conforme a la Ley 25.326 de Protección de los Datos Personales, la persona usuaria tiene derecho a acceder a sus datos, rectificarlos, actualizarlos y solicitar su supresión, y puede presentar reclamos ante la Agencia de Acceso a la Información Pública, órgano de control de esa ley. Al aceptar estos términos se deja constancia de la fecha y de la versión aceptada.",
  },
  {
    title: "6. Personas menores de edad",
    body:
      "Las personas menores de 18 años solo deben usar EcoHuella con el conocimiento y la autorización de su madre, padre o tutor, o de la institución educativa que propone la actividad. Al aceptar estos términos, quien lo hace declara contar con esa autorización cuando corresponda. Se recomienda cargar solo los datos necesarios (la foto de perfil es opcional). Las personas responsables pueden solicitar el acceso, la rectificación o la eliminación de los datos del menor por los canales indicados en la sección 14.",
  },
  {
    title: "7. Resultados, estimaciones y limitaciones",
    body:
      "Los cálculos, resultados, métricas, recomendaciones y tableros generados por EcoHuella son estimaciones basadas en datos ingresados por la persona usuaria, parámetros disponibles y criterios internos de cálculo. Pueden existir diferencias con mediciones reales, auditorías técnicas o evaluaciones profesionales. La persona usuaria acepta utilizar los resultados como referencia orientativa.",
  },
  {
    title: "8. Propiedad intelectual",
    body:
      "El diseño, código, estructura, textos, interfaces, marcas, nombres, iconos, bases de datos, contenidos y demás elementos de EcoHuella pertenecen a sus titulares o se utilizan con autorización/licencia correspondiente. No se concede ningún derecho de propiedad intelectual salvo el uso limitado, revocable y no exclusivo necesario para acceder a la plataforma.",
  },
  {
    title: "9. Responsabilidad de la persona usuaria",
    body:
      "La persona usuaria responde por la información que carga, por el uso que haga de la plataforma y por las consecuencias derivadas de decisiones adoptadas en base a los resultados. EcoHuella no será responsable por errores ocasionados por datos incompletos, inexactos, desactualizados o cargados indebidamente.",
  },
  {
    title: "10. Disponibilidad y modificaciones",
    body:
      "EcoHuella podrá modificar, suspender, actualizar o discontinuar total o parcialmente sus funcionalidades por mantenimiento, mejoras, razones técnicas, seguridad o cambios del proyecto. La plataforma no garantiza disponibilidad ininterrumpida ni ausencia absoluta de errores, aunque procurará mantener un funcionamiento razonable.",
  },
  {
    title: "11. Administración y moderación",
    body:
      "Las cuentas con permisos administrativos podrán gestionar usuarios, preguntas, parámetros y resultados conforme a los alcances del sistema. EcoHuella podrá suspender, restringir o eliminar cuentas ante incumplimientos, usos abusivos, riesgos de seguridad o requerimientos legales.",
  },
  {
    title: "12. Conservación y eliminación de información",
    body:
      "La información podrá conservarse mientras sea necesaria para el funcionamiento de la cuenta, fines académicos, administrativos, estadísticos, de seguridad o cumplimiento legal. Cuando corresponda, la persona usuaria podrá solicitar actualización, rectificación o eliminación de datos, sujeto a limitaciones técnicas, legales o de respaldo.",
  },
  {
    title: "13. Cambios en estos términos",
    body:
      "EcoHuella podrá actualizar estos Términos y Condiciones. Cuando los cambios sean relevantes, se podrá requerir una nueva aceptación para continuar utilizando la plataforma. El uso posterior a la actualización implica aceptación de la versión vigente.",
  },
  {
    title: "14. Contacto",
    body:
      "Para consultas, solicitudes o reclamos vinculados con la plataforma, privacidad, acceso o eliminación de datos, la persona usuaria podrá comunicarse con el equipo responsable de EcoHuella por los canales institucionales disponibles.",
  },
];

const TermsAndConditionsPage = () => {
  const { isAuthenticated, checkingAuth, termsAccepted, acceptTerms, rejectTerms } = useAuth();
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState("");

  // Los términos se pueden leer siempre (también desde el pie de página y sin cuenta);
  // los botones de aceptar o rechazar solo aparecen cuando falta aceptarlos.
  if (isAuthenticated && checkingAuth) {
    return null;
  }

  const mustAccept = isAuthenticated && !termsAccepted;

  const handleAccept = async () => {
    setAcceptError("");
    setIsAccepting(true);
    const accepted = await acceptTerms();
    setIsAccepting(false);

    if (!accepted) {
      setAcceptError("No pudimos registrar tu aceptación. Revisa tu conexión e intenta de nuevo.");
      return;
    }

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
          <UniversityBadge variant="inline" className="terms-uni" />
          <span className="terms-eyebrow">Uso responsable de EcoHuella</span>
          <h1>Términos y Condiciones</h1>
          <p>
            {mustAccept
              ? "Antes de acceder a la plataforma, revisa y acepta las condiciones aplicables al uso del servicio, tratamiento de datos y alcance de los resultados ambientales."
              : "Estas son las condiciones aplicables al uso del servicio, el tratamiento de datos y el alcance de los resultados ambientales."}
          </p>
        </div>

        <div className="terms-scroll" tabIndex="0">
          <p className="terms-date">
            Última actualización: 23 de octubre de 2026
          </p>
          {sections.map((section) => (
            <article key={section.title} className="terms-section">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>

        {acceptError && (
          <p className="profile-alert error" role="alert">
            {acceptError}
          </p>
        )}

        <div className="terms-actions">
          {mustAccept ? (
            <>
              <button type="button" className="terms-reject" onClick={handleReject} disabled={isAccepting}>
                No acepto
              </button>
              <button type="button" className="terms-accept" onClick={handleAccept} disabled={isAccepting}>
                {isAccepting ? "Registrando..." : "Acepto los términos"}
              </button>
            </>
          ) : (
            <button type="button" className="terms-accept" onClick={() => navigate("/")}>
              Volver al inicio
            </button>
          )}
        </div>
      </section>
    </main>
  );
};

export default TermsAndConditionsPage;
