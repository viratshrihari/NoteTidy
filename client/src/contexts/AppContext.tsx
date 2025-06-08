import { createContext, useContext, useReducer, useEffect } from "react";
import type { Note, ChatMessage } from "@shared/schema";

type NoteStyle = "cornell" | "bullet" | "mindmap" | "freeform";

interface AppState {
  currentTab: string;
  notes: Note[];
  chatMessages: ChatMessage[];
  settings: {
    defaultNoteStyle: NoteStyle;
    autoSave: boolean;
  };
  searchQuery: string;
  filterType: string;
}

type AppAction =
  | { type: "SET_TAB"; payload: string }
  | { type: "SET_NOTES"; payload: Note[] }
  | { type: "ADD_NOTE"; payload: Note }
  | { type: "UPDATE_NOTE"; payload: { id: number; note: Partial<Note> } }
  | { type: "DELETE_NOTE"; payload: number }
  | { type: "SET_CHAT_MESSAGES"; payload: ChatMessage[] }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "CLEAR_CHAT"; payload: void }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppState["settings"]> }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_FILTER_TYPE"; payload: string };

const initialState: AppState = {
  currentTab: "uploadTab",
  notes: [],
  chatMessages: [],
  settings: {
    defaultNoteStyle: "freeform",
    autoSave: true,
  },
  searchQuery: "",
  filterType: "all",
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, currentTab: action.payload };
    case "SET_NOTES":
      return { ...state, notes: action.payload };
    case "ADD_NOTE":
      return { ...state, notes: [action.payload, ...state.notes] };
    case "UPDATE_NOTE":
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id
            ? { ...note, ...action.payload.note }
            : note
        ),
      };
    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
      };
    case "SET_CHAT_MESSAGES":
      return { ...state, chatMessages: action.payload };
    case "ADD_CHAT_MESSAGE":
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case "CLEAR_CHAT":
      return { ...state, chatMessages: [] };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_FILTER_TYPE":
      return { ...state, filterType: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("noteflow-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: "UPDATE_SETTINGS", payload: settings });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("noteflow-settings", JSON.stringify(state.settings));
  }, [state.settings]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
