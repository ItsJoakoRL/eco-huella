// Deja una sola cuenta en la base: borra todas las demás (y sus encuestas) y, si se
// define NEW_PASSWORD, cambia la contraseña de la cuenta que queda.
//
// Por defecto solo SIMULA: muestra qué haría y no toca nada. Para ejecutarlo de verdad
// hay que agregar --yes. No se puede deshacer.
//
//   $env:MONGODB_URI = "<uri de la base>"
//   $env:NEW_PASSWORD = "<contraseña nueva>"          (opcional)
//   node scripts/keep-only-account.js --keep tu@correo.com
//   node scripts/keep-only-account.js --keep tu@correo.com --yes
//
// --keep acepta el email o el nombre de usuario. Si no hay exactamente una cuenta que
// coincida, el script aborta sin borrar nada.
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import QuizResult from "../models/QuizResult.js";

dotenv.config();

const args = process.argv.slice(2);
const keepIndex = args.indexOf("--keep");
const keepValue = keepIndex >= 0 ? (args[keepIndex + 1] || "").trim().toLowerCase() : "";
const confirmed = args.includes("--yes");
const newPassword = process.env.NEW_PASSWORD;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!keepValue || keepValue.startsWith("--")) {
  fail("Falta --keep <email o usuario>. Ejemplo: node scripts/keep-only-account.js --keep tu@correo.com");
}
if (newPassword !== undefined && newPassword.length < 6) {
  fail("NEW_PASSWORD debe tener al menos 6 caracteres.");
}

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
if (!mongoUri) fail("Falta MONGODB_URI.");

const describe = (user) =>
  `${user.username} <${user.email}> [${user.role}] creada ${user.createdAt?.toISOString().slice(0, 10) ?? "?"}`;

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  // Solo el host, nunca las credenciales de la URI.
  const host = mongoUri.replace(/^mongodb(\+srv)?:\/\/([^@/]*@)?/, "").split(/[/?]/)[0];
  console.log(`Base: ${host} / ${mongoose.connection.name}\n`);

  const users = await User.find().select("-avatarUrl").sort({ createdAt: 1 });
  const matches = users.filter(
    (user) => user.email === keepValue || user.username === keepValue
  );

  if (matches.length !== 1) {
    console.error(
      matches.length === 0
        ? `No hay ninguna cuenta con email o usuario "${keepValue}". No se borró nada.`
        : `Hay ${matches.length} cuentas que coinciden con "${keepValue}". No se borró nada.`
    );
    console.error(`\nCuentas existentes (${users.length}):`);
    users.forEach((user) => console.error(`  - ${describe(user)}`));
    process.exit(1);
  }

  const keep = matches[0];
  const others = users.filter((user) => String(user._id) !== String(keep._id));
  const resultsToDelete = await QuizResult.countDocuments({ userId: { $ne: keep._id } });

  console.log(`Se conserva:\n  + ${describe(keep)}`);
  if (keep.role !== "admin") {
    console.log("  ! Ojo: esa cuenta NO es administrador; después de borrar no quedará ningún admin.");
  }
  console.log(newPassword ? "  Su contraseña se va a cambiar.\n" : "  Su contraseña no se toca.\n");

  console.log(`Se borran ${others.length} cuenta(s) y ${resultsToDelete} resultado(s) de encuestas de otros usuarios:`);
  others.forEach((user) => console.log(`  - ${describe(user)}`));

  if (!confirmed) {
    console.log("\nSimulación: no se modificó nada. Para ejecutarlo de verdad, agrega --yes.");
    process.exit(0);
  }

  if (newPassword) {
    const doc = await User.findById(keep._id).select("+password");
    doc.password = newPassword;
    doc.resetPasswordToken = undefined;
    doc.resetPasswordExpires = undefined;
    doc.resetPasswordAttempts = 0;
    // Se valida la longitud arriba; no se revalida el resto del documento por si
    // la cuenta tiene datos viejos que ya no cumplen el esquema.
    await doc.save({ validateBeforeSave: false });
    console.log("\nContraseña cambiada (las sesiones abiertas de esa cuenta se cierran).");
  }

  const deletedResults = await QuizResult.deleteMany({ userId: { $ne: keep._id } });
  const deletedUsers = await User.deleteMany({ _id: { $ne: keep._id } });
  console.log(`Borradas ${deletedUsers.deletedCount} cuenta(s) y ${deletedResults.deletedCount} resultado(s).`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
