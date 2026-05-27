/**
 * Bootstrap do primeiro admin_master do GovTech.
 *
 * Pré-requisito (uma vez):
 *   gcloud auth application-default login
 *
 * Uso:
 *   node scripts/createAdmin.js admin@pmaautomacao.com SenhaForte123! "Admin GovTech"
 */
const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'govtech-pma',
});

const [, , email, password, displayName = 'Administrador Master'] = process.argv;

if (!email || !password) {
  console.error('Uso: node scripts/createAdmin.js <email> <senha> [nome]');
  process.exit(1);
}

async function run() {
  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
    console.log(`Usuário já existe: ${user.uid}. Atualizando claims e senha...`);
    await admin.auth().updateUser(user.uid, { password, displayName });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      user = await admin.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });
      console.log(`Usuário criado: ${user.uid}`);
    } else {
      throw err;
    }
  }

  await admin.auth().setCustomUserClaims(user.uid, { role: 'admin_master' });

  await admin.firestore().collection('users').doc(user.uid).set(
    {
      email,
      displayName,
      role: 'admin_master',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log('\n✅ admin_master configurado com sucesso.');
  console.log(`   Email: ${email}`);
  console.log(`   UID:   ${user.uid}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Falhou:', err.message || err);
  if (err.code === 'app/invalid-credential' || (err.message || '').includes('credential')) {
    console.error('\n💡 Rode antes:  gcloud auth application-default login');
  }
  process.exit(1);
});
