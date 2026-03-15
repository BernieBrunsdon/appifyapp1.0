import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Client already has a demo agent in Firestore (works even when API /me returns 404).
 * clients/{uid} is readable by that user per firestore.rules.
 */
export async function clientHasDemoAgent(uid) {
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, 'clients', uid));
    if (!snap.exists) return false;
    const d = snap.data();
    return !!(
      d.demo_assistant_id ||
      d.vapiAssistantId ||
      d.onboardingStage === 'demo_ready' ||
      d.onboardingStage === 'build_requested'
    );
  } catch {
    return false;
  }
}
