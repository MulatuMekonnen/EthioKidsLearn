import { authentication } from '../firebase';

export const authService = {
  // Sign up with email and password
  signUp: async (email, password) => {
    try {
      const response = await authentication.createUserWithEmailAndPassword(
        email,
        password
      );
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const response = await authentication.signInWithEmailAndPassword(
        email,
        password
      );
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await authentication.signOut();
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return authentication.currentUser;
  }
}; 