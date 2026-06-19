import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes, ROUTINE_COLORS } from '../theme';

const STORAGE_KEY = '@momentum/state/v1';
const WAKE_UP_TITLE = 'Wake Up';
const WAKE_UP_DURATION = '15 min';

export const PLAN_LIMITS = {
  starter: { maxRoutines: 3 },
  pro: { maxRoutines: 10 },
  enterprise: { maxRoutines: Infinity },
};
export function useSubscription() {
  const { state } = useApp(); 
  
  const currentPlan = state.prefs?.plan || 'starter'; 

  const canAddRoutine = (currentRoutineCount) => {
    const limit = PLAN_LIMITS[currentPlan]?.maxRoutines || 3;
    return currentRoutineCount < limit;
  };

  return { 
    currentPlan, 
    canAddRoutine 
  };
}

// ---------------------------------------------------------------------------
// Seed data (mirrors the paper prototype)
// ---------------------------------------------------------------------------
const todayISO = () => new Date().toISOString().slice(0, 10);

const seedRoutines = [
  {
    id: 'r1',
    title: 'Morning Routine',
    emoji: '🌅',
    color: ROUTINE_COLORS[0],
    time: '07:00',
    days: 'Every day',
    isMorningRoutine: true,
    currentStreak: 12,
    bestStreak: 24,
    completedToday: true,
    tasks: [
      { id: 't1', title: 'Drink a glass of water', duration: '1 min', done: true },
      { id: 't2', title: '5-min meditation', duration: '5 min', done: true },
      { id: 't3', title: 'Make the bed', duration: '2 min', done: true },
      { id: 't4', title: 'Brush teeth & wash face', duration: '3 min', done: false },
    ],
  },
  {
    id: 'r2',
    title: 'Workout',
    emoji: '💪',
    color: ROUTINE_COLORS[1],
    time: '17:30',
    days: 'Mon, Wed, Fri',
    isMorningRoutine: false,
    currentStreak: 5,
    bestStreak: 9,
    completedToday: false,
    tasks: [
      { id: 't5', title: 'Warm up', duration: '5 min', done: false },
      { id: 't6', title: 'Strength training', duration: '30 min', done: false },
      { id: 't7', title: 'Stretch', duration: '10 min', done: false },
    ],
  },
  {
    id: 'r3',
    title: 'Evening Routine',
    emoji: '🌙',
    color: ROUTINE_COLORS[2],
    time: '22:00',
    days: 'Every day',
    isMorningRoutine: false,
    currentStreak: 8,
    bestStreak: 15,
    completedToday: false,
    tasks: [
      { id: 't8', title: 'Plan tomorrow', duration: '5 min', done: false },
      { id: 't9', title: 'Read a book', duration: '15 min', done: false },
    ],
  },
];

const seedTasks = [
  {
    id: 'k1',
    title: 'Group Meeting',
    description: 'Weekly sync with the project team.',
    date: todayISO(),
    time: '14:00',
    color: ROUTINE_COLORS[3],
    emoji: '👥',
    done: false,
  },
  {
    id: 'k2',
    title: 'Gym session',
    description: 'Leg day.',
    date: todayISO(),
    time: '18:30',
    color: ROUTINE_COLORS[1],
    emoji: '🏋️',
    done: false,
  },
];

const initialState = {
  hydrated: false,
  themeMode: 'system', // 'light' | 'dark' | 'system'
  user: null, // { fullName, email }
  prefs: {
    notifications: true,
    language: 'English',
    timeFormat: '12-hour',
  },
  currentStreak: 7,
  totalFlames: 142,
  bestStreak: 24,
  routines: seedRoutines,
  tasks: seedTasks,
  calendarLayout: 'Month', // Year | Month | Week | Day
};



// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function setRoutineCompletion(state, routineId, completed, completeTasks = false) {
  const routine = state.routines.find((r) => r.id === routineId);
  if (!routine) return state;

  const alreadyCompleted = routine.completedToday;
  if (alreadyCompleted === completed && !completeTasks) return state;

  const delta = alreadyCompleted === completed ? 0 : completed ? 1 : -1;
  const nextStreak = completed
    ? alreadyCompleted
      ? routine.currentStreak
      : routine.currentStreak + 1
    : alreadyCompleted
      ? Math.max(0, routine.currentStreak - 1)
      : routine.currentStreak;

  return {
    ...state,
    totalFlames: state.totalFlames + delta,
    routines: state.routines.map((r) =>
      r.id === routineId
        ? {
            ...r,
            completedToday: completed,
            currentStreak: nextStreak,
            bestStreak: completed ? Math.max(r.bestStreak, nextStreak) : r.bestStreak,
            tasks: completeTasks ? r.tasks.map((t) => ({ ...t, done: true })) : r.tasks,
          }
        : r
    ),
  };
}

function isWakeUpTask(task) {
  return task?.title?.trim().toLowerCase() === WAKE_UP_TITLE.toLowerCase();
}

function ensureWakeUpTask(routine) {
  const tasks = Array.isArray(routine.tasks) ? routine.tasks : [];
  if (!routine.isMorningRoutine) return { ...routine, tasks };
  if (tasks.some((task) => isWakeUpTask(task))) return { ...routine, tasks };
  return {
    ...routine,
    tasks: [
      ...tasks,
      {
        id: `${routine.id || 'routine'}-wake`,
        title: WAKE_UP_TITLE,
        duration: WAKE_UP_DURATION,
        done: false,
      },
    ],
  };
}

function normalizeRoutines(routines) {
  const list = Array.isArray(routines) ? routines.map((routine) => ({ ...routine })) : [];
  const hasFlaggedMorning = list.some((routine) => routine.isMorningRoutine);

  if (!hasFlaggedMorning) {
    const fallbackMorning = list.findIndex(
      (routine) => routine.title?.trim().toLowerCase() === 'morning routine'
    );
    if (fallbackMorning >= 0) {
      list[fallbackMorning] = { ...list[fallbackMorning], isMorningRoutine: true };
    }
  }

  let morningTaken = false;
  return list.map((routine) => {
    const canBeMorning = Boolean(routine.isMorningRoutine) && !morningTaken;
    if (canBeMorning) morningTaken = true;
    return ensureWakeUpTask({ ...routine, isMorningRoutine: canBeMorning });
  });
}

function canUseMorningRoutine(state, routineId) {
  return !state.routines.some((routine) => routine.isMorningRoutine && routine.id !== routineId);
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        ...action.payload,
        routines: normalizeRoutines(action.payload?.routines ?? state.routines),
        hydrated: true,
      };
    case 'SET_HYDRATED':
      return { ...state, hydrated: true };
    case 'SET_THEME':
      return { ...state, themeMode: action.mode };
    case 'LOGIN':
      return { ...state, user: action.user };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.patch } };
    case 'SET_PREF':
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } };
    case 'SET_LAYOUT':
      return { ...state, calendarLayout: action.layout };

    // ----------------------------------------------------
    case 'UPDATE_PLAN':
      return {
        ...state,
        prefs: {
          ...state.prefs,
          plan: action.plan
        }
      };
    // ----------------------------------------------------

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };

    case 'ADD_ROUTINE':
      {
        const isMorningRoutine = action.routine.isMorningRoutine && canUseMorningRoutine(state);
        const nextRoutine = ensureWakeUpTask({
          ...action.routine,
          isMorningRoutine,
        });
      return {
        ...state,
        routines: [...state.routines, nextRoutine],
      };
      }
    case 'UPDATE_ROUTINE':
      return {
        ...state,
        routines: state.routines.map((r) =>
          r.id === action.id
            ? ensureWakeUpTask({
                ...r,
                ...action.patch,
                isMorningRoutine:
                  action.patch?.isMorningRoutine === true
                    ? canUseMorningRoutine(state, action.id)
                    : action.patch?.isMorningRoutine === false
                      ? false
                      : r.isMorningRoutine,
              })
            : ensureWakeUpTask(r)
        ),
      };
    case 'DELETE_ROUTINE':
      return { ...state, routines: state.routines.filter((r) => r.id !== action.id) };

    case 'TOGGLE_ROUTINE_TASK':
      {
        const toggledState = {
          ...state,
          routines: state.routines.map((r) => {
            if (r.id !== action.routineId) return r;
            return {
              ...r,
              tasks: r.tasks.map((t) =>
                t.id === action.taskId ? { ...t, done: !t.done } : t
              ),
            };
          }),
        };

        const routine = toggledState.routines.find((r) => r.id === action.routineId);
        const allTasksDone = routine?.tasks.length > 0 && routine.tasks.every((t) => t.done);

        return routine ? setRoutineCompletion(toggledState, action.routineId, allTasksDone) : toggledState;
      }
    case 'ADD_ROUTINE_TASK':
      {
        const nextState = {
            ...state,
            routines: state.routines.map((r) =>
              r.id === action.routineId ? { ...r, tasks: [...r.tasks, action.task] } : r
            ),
          };
        const routine = nextState.routines.find((r) => r.id === action.routineId);
        const allTasksDone = routine?.tasks.length > 0 && routine.tasks.every((t) => t.done);
        return routine ? setRoutineCompletion(nextState, action.routineId, allTasksDone) : nextState;
      }
    case 'COMPLETE_ROUTINE':
      return setRoutineCompletion(state, action.id, true, true);
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const systemScheme = useColorScheme();

  // Load persisted state once.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
        } else {
          dispatch({ type: 'SET_HYDRATED' });
        }
      } catch (e) {
        dispatch({ type: 'SET_HYDRATED' });
      }
    })();
  }, []);

  // Persist a subset of state whenever it changes (after hydration).
  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated, ...toSave } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
  }, [state]);

  const resolvedMode =
    state.themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : state.themeMode;
  const colors = palettes[resolvedMode];

  const value = useMemo(
    () => ({
      state,
      dispatch,
      colors,
      isDark: resolvedMode === 'dark',
      // convenience actions
      login: (user) => dispatch({ type: 'LOGIN', user }),
      logout: () => dispatch({ type: 'LOGOUT' }),
      setTheme: (mode) => dispatch({ type: 'SET_THEME', mode }),
    }),
    [state, colors, resolvedMode]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useColors() {
  return useApp().colors;
}
