// Firebase Service for Client Data Management
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

export class FirebaseService {
  
  // Create a new client
  static async createClient(clientData) {
    try {
      const clientRef = doc(db, 'clients', clientData.id);
      const clientDoc = {
        ...clientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(clientRef, clientDoc);
      console.log('✅ Client created in Firestore:', clientData.id);
      return clientData;
    } catch (error) {
      console.error('❌ Error creating client in Firestore:', error);
      throw error;
    }
  }
  
  // Get client by ID
  static async getClient(clientId) {
    try {
      const clientRef = doc(db, 'clients', clientId);
      const clientSnap = await getDoc(clientRef);
      
      if (clientSnap.exists()) {
        return { id: clientSnap.id, ...clientSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting client from Firestore:', error);
      throw error;
    }
  }
  
  // Update client data
  static async updateClient(clientId, updateData) {
    try {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Client updated in Firestore:', clientId);
    } catch (error) {
      console.error('❌ Error updating client in Firestore:', error);
      throw error;
    }
  }
  
  // Create agent for client
  static async createAgent(agentData) {
    try {
      const agentRef = doc(collection(db, 'agents'));
      const agentDoc = {
        ...agentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(agentRef, agentDoc);
      console.log('✅ Agent created in Firestore:', agentRef.id);
      return { id: agentRef.id, ...agentDoc };
    } catch (error) {
      console.error('❌ Error creating agent in Firestore:', error);
      throw error;
    }
  }
  
  // Get agents for a client
  static async getClientAgents(clientId) {
    try {
      const agentsRef = collection(db, 'agents');
      const q = query(
        agentsRef, 
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const agents = [];
      querySnapshot.forEach((doc) => {
        agents.push({ id: doc.id, ...doc.data() });
      });
      
      return agents;
    } catch (error) {
      console.error('❌ Error getting client agents from Firestore:', error);
      throw error;
    }
  }
  
  // Create call log entry
  static async createCallLog(callData) {
    try {
      const callRef = doc(collection(db, 'callLogs'));
      const callDoc = {
        ...callData,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      await setDoc(callRef, callDoc);
      console.log('✅ Call log created in Firestore:', callRef.id);
      return { id: callRef.id, ...callDoc };
    } catch (error) {
      console.error('❌ Error creating call log in Firestore:', error);
      throw error;
    }
  }
  
  // Get call logs for a client
  static async getClientCallLogs(clientId, limitCount = 50) {
    try {
      const callLogsRef = collection(db, 'callLogs');
      const q = query(
        callLogsRef,
        where('clientId', '==', clientId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const callLogs = [];
      querySnapshot.forEach((doc) => {
        callLogs.push({ id: doc.id, ...doc.data() });
      });
      
      return callLogs;
    } catch (error) {
      console.error('❌ Error getting call logs from Firestore:', error);
      throw error;
    }
  }
  
  // Check if email already exists
  static async checkEmailExists(email) {
    try {
      // First check in the users collection (Firebase Auth users)
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, where('email', '==', email));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        return true;
      }
      
      // Also check in the clients collection
      const clientsRef = collection(db, 'clients');
      const clientsQuery = query(clientsRef, where('email', '==', email));
      const clientsSnapshot = await getDocs(clientsQuery);
      
      return !clientsSnapshot.empty;
    } catch (error) {
      console.error('❌ Error checking email in Firestore:', error);
      // Return false to allow registration to proceed if there's an error
      return false;
    }
  }
  
  // Get all clients (admin only)
  static async getAllClients() {
    try {
      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const clients = [];
      querySnapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() });
      });
      
      return clients;
    } catch (error) {
      console.error('❌ Error getting all clients from Firestore:', error);
      throw error;
    }
  }
}

