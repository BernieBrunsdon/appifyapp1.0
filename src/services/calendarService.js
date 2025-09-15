// Google Calendar Service
class CalendarService {
  constructor() {
    this.gapi = null;
    this.isInitialized = false;
    this.isSignedIn = false;
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id';
    this.apiKey = process.env.REACT_APP_GOOGLE_API_KEY || 'your-google-api-key';
    this.discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
    this.scopes = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
  }

  // Initialize Google API
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load Google API script
      await this.loadGoogleAPI();
      
      // Initialize GAPI
      await new Promise((resolve, reject) => {
        window.gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject
        });
      });

      // Initialize client
      await window.gapi.client.init({
        apiKey: this.apiKey,
        clientId: this.clientId,
        discoveryDocs: [this.discoveryDoc],
        scope: this.scopes
      });

      this.gapi = window.gapi;
      this.isInitialized = true;
      
      // Check if user is already signed in
      this.isSignedIn = this.gapi.auth2.getAuthInstance().isSignedIn.get();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Calendar API:', error);
      return false;
    }
  }

  // Load Google API script
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Sign in to Google Calendar
  async signIn() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      this.isSignedIn = true;
      return {
        success: true,
        user: user.getBasicProfile(),
        accessToken: user.getAuthResponse().access_token
      };
    } catch (error) {
      console.error('Google Calendar sign-in failed:', error);
      return {
        success: false,
        error: 'Failed to sign in to Google Calendar. Please try again.'
      };
    }
  }

  // Sign out from Google Calendar
  async signOut() {
    if (!this.isInitialized || !this.isSignedIn) return;

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.isSignedIn = false;
      return { success: true };
    } catch (error) {
      console.error('Google Calendar sign-out failed:', error);
      return { success: false, error: 'Failed to sign out from Google Calendar.' };
    }
  }

  // Get user's calendars
  async getCalendars() {
    if (!this.isInitialized || !this.isSignedIn) {
      return { success: false, error: 'Not signed in to Google Calendar' };
    }

    try {
      const response = await this.gapi.client.calendar.calendarList.list();
      const calendars = response.result.items || [];
      
      return {
        success: true,
        calendars: calendars.map(cal => ({
          id: cal.id,
          name: cal.summary,
          description: cal.description,
          primary: cal.primary,
          accessRole: cal.accessRole
        }))
      };
    } catch (error) {
      console.error('Failed to get calendars:', error);
      return {
        success: false,
        error: 'Failed to retrieve calendars. Please try again.'
      };
    }
  }

  // Get events from a calendar
  async getEvents(calendarId = 'primary', maxResults = 10) {
    if (!this.isInitialized || !this.isSignedIn) {
      return { success: false, error: 'Not signed in to Google Calendar' };
    }

    try {
      const response = await this.gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.result.items || [];
      
      return {
        success: true,
        events: events.map(event => ({
          id: event.id,
          title: event.summary,
          description: event.description,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          location: event.location,
          attendees: event.attendees || []
        }))
      };
    } catch (error) {
      console.error('Failed to get events:', error);
      return {
        success: false,
        error: 'Failed to retrieve events. Please try again.'
      };
    }
  }

  // Create an event
  async createEvent(eventData) {
    if (!this.isInitialized || !this.isSignedIn) {
      return { success: false, error: 'Not signed in to Google Calendar' };
    }

    try {
      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.start,
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: eventData.end,
          timeZone: 'America/New_York'
        },
        attendees: eventData.attendees || [],
        reminders: {
          useDefault: true
        }
      };

      const response = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return {
        success: true,
        event: {
          id: response.result.id,
          title: response.result.summary,
          start: response.result.start.dateTime,
          end: response.result.end.dateTime
        }
      };
    } catch (error) {
      console.error('Failed to create event:', error);
      return {
        success: false,
        error: 'Failed to create event. Please try again.'
      };
    }
  }

  // Check if user is signed in
  isUserSignedIn() {
    return this.isSignedIn;
  }

  // Get user info
  async getUserInfo() {
    if (!this.isInitialized || !this.isSignedIn) {
      return null;
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      const profile = user.getBasicProfile();
      
      return {
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }
}

// Create singleton instance
const calendarService = new CalendarService();

export default calendarService;